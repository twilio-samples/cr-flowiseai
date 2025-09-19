exports.handler = async function (context, event, callback) {
  const response = new Twilio.Response();
  response.appendHeader("Content-Type", "application/json");

  try {
    // Get phone number from POST body
    const { phoneNumber } = event;

    // Validate required parameter
    if (!phoneNumber) {
      response.setStatusCode(400);
      response.setBody({
        success: false,
        error: "Phone number is required",
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

      // Find all classes booked by this user
      const userBookings = [];

      for (const [className, classInfo] of Object.entries(classes)) {
        if (classInfo.booked.includes(phoneNumber)) {
          userBookings.push({
            className: className, // Using class name as identifier
            time: classInfo.time,
            day: classInfo.day,
            duration: classInfo.duration,
            instructor: classInfo.instructor,
            description: classInfo.description,
          });
        }
      }

      // Sort bookings by time for better user experience
      userBookings.sort((a, b) => {
        // Simple time comparison (this is basic, could be enhanced)
        const timeA = a.time.replace(/[^\d]/g, "");
        const timeB = b.time.replace(/[^\d]/g, "");
        return timeA.localeCompare(timeB);
      });

      response.setStatusCode(200);
      response.setBody({
        success: true,
        message:
          userBookings.length > 0
            ? `You have ${userBookings.length} class${userBookings.length > 1 ? "es" : ""} booked`
            : "You have no classes booked",
        bookings: userBookings,
        totalBookings: userBookings.length,
      });

      callback(null, response);
    } catch (error) {
      if (error.status === 404) {
        // Classes document doesn't exist yet
        response.setStatusCode(200);
        response.setBody({
          success: true,
          message: "You have no classes booked",
          bookings: [],
          totalBookings: 0,
        });
        callback(null, response);
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error("Error fetching bookings:", error);
    response.setStatusCode(500);
    response.setBody({
      success: false,
      error: "Failed to fetch bookings",
    });
    callback(null, response);
  }
};
