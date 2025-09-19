exports.handler = async function (context, event, callback) {
  const response = new Twilio.Response();
  response.appendHeader("Content-Type", "application/json");

  try {
    // Extract parameters from request
    // Now expecting className instead of classId
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

    // Validate phone number format
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

      // Check if user has booked this class
      const bookingIndex = classInfo.booked.indexOf(phoneNumber);
      if (bookingIndex === -1) {
        response.setStatusCode(400);
        response.setBody({
          success: false,
          error: "You have not booked this class",
        });
        return callback(null, response);
      }

      // Remove user from the class
      classInfo.booked.splice(bookingIndex, 1);

      // Update the document
      await sync.documents("classes").update({
        data: classes,
      });

      // Return success response
      response.setStatusCode(200);
      response.setBody({
        success: true,
        message: `Successfully cancelled your booking for ${classInfo.name}`,
        cancellation: {
          className: className, // Using class name as identifier
          time: classInfo.time,
          day: classInfo.day,
          spotsNowAvailable: classInfo.capacity - classInfo.booked.length,
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
    console.error("Error cancelling booking:", error);
    response.setStatusCode(500);
    response.setBody({
      success: false,
      error: "Failed to cancel booking",
    });
    callback(null, response);
  }
};
