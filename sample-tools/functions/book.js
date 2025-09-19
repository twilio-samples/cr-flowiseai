exports.handler = async function (context, event, callback) {
  const response = new Twilio.Response();
  response.appendHeader("Content-Type", "application/json");

  try {
    // Extract parameters from POST request
    // Now expecting the class name/title instead of classId
    const { phoneNumber, className } = event;

    // Validate required parameters
    if (!phoneNumber || !className) {
      response.setStatusCode(400);
      response.setBody({
        success: false,
        error: "Phone number and class name are required",
      });
      return callback(null, response);
    }

    // Validate phone number format (basic validation)
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber)) {
      response.setStatusCode(400);
      response.setBody({
        success: false,
        error:
          "Invalid phone number format. Please use E.164 format (e.g., +1234567890)",
      });
      return callback(null, response);
    }

    const sync = Runtime.getSync();

    try {
      // Fetch the classes document
      const classesDoc = await sync.documents("classes").fetch();
      const classes = classesDoc.data;

      // Check if class exists (now using class name as key)
      if (!classes[className]) {
        response.setStatusCode(404);
        response.setBody({
          success: false,
          error: "Class not found",
        });
        return callback(null, response);
      }

      const classInfo = classes[className];

      // Check if user already booked this class
      if (classInfo.booked.includes(phoneNumber)) {
        response.setStatusCode(400);
        response.setBody({
          success: false,
          error: "You have already booked this class",
        });
        return callback(null, response);
      }

      // Check if class is full
      if (classInfo.booked.length >= classInfo.capacity) {
        response.setStatusCode(400);
        response.setBody({
          success: false,
          error: "Sorry, this class is full",
        });
        return callback(null, response);
      }

      // Add user to the class
      classInfo.booked.push(phoneNumber);

      // Update the document
      await sync.documents("classes").update({
        data: classes,
      });

      // Return success response
      response.setStatusCode(200);
      response.setBody({
        success: true,
        message: `Successfully booked ${classInfo.name}`,
        booking: {
          className: className, // Using class name as identifier
          time: classInfo.time,
          day: classInfo.day,
          duration: classInfo.duration,
          instructor: classInfo.instructor,
          spotsRemaining: classInfo.capacity - classInfo.booked.length,
        },
      });

      callback(null, response);
    } catch (error) {
      if (error.status === 404) {
        // Classes document doesn't exist
        response.setStatusCode(500);
        response.setBody({
          success: false,
          error: "Class system not initialized. Please try again later.",
        });
        callback(null, response);
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error("Error booking class:", error);
    response.setStatusCode(500);
    response.setBody({
      success: false,
      error: "Failed to book class",
    });
    callback(null, response);
  }
};
