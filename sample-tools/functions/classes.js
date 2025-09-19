exports.handler = async function (context, event, callback) {
  const response = new Twilio.Response();
  response.appendHeader("Content-Type", "application/json");

  try {
    const sync = Runtime.getSync();
    let classesDoc;

    try {
      // Try to fetch existing classes document
      classesDoc = await sync.documents("classes").fetch();
    } catch (error) {
      if (error.status === 404) {
        // Create initial classes if document doesn't exist - now only 4 classes
        const initialClasses = {
          "Midnight Yoga": {
            name: "Midnight Yoga",
            time: "12:00 AM",
            day: "Daily",
            duration: "60 min",
            instructor: "Luna Chen",
            capacity: 15,
            description: "Peaceful yoga session under the moonlight",
            booked: [],
          },
          "Night Owl Strength": {
            name: "Night Owl Strength",
            time: "11:00 PM",
            day: "Tuesday/Thursday/Saturday",
            duration: "60 min",
            instructor: "Alex Rivera",
            capacity: 18,
            description: "Full body strength training for night owls",
            booked: [],
          },
          "Insomnia Boxing": {
            name: "Insomnia Boxing",
            time: "2:00 AM",
            day: "Monday/Wednesday/Friday",
            duration: "50 min",
            instructor: "Mike Chen",
            capacity: 12,
            description: "Release stress with boxing workouts",
            booked: [],
          },
          "Moonlight Pilates": {
            name: "Moonlight Pilates",
            time: "10:00 PM",
            day: "Monday/Wednesday/Friday",
            duration: "55 min",
            instructor: "Emma Thompson",
            capacity: 16,
            description: "Core-focused pilates under the stars",
            booked: [],
          },
        };

        classesDoc = await sync.documents.create({
          uniqueName: "classes",
          data: initialClasses,
        });
      } else {
        throw error;
      }
    }

    // Get all classes and filter available ones
    const allClasses = classesDoc.data;
    const availableClasses = {};

    for (const [className, classInfo] of Object.entries(allClasses)) {
      const spotsLeft = classInfo.capacity - classInfo.booked.length;
      if (spotsLeft > 0) {
        availableClasses[className] = {
          id: className, // Using the class name as the ID
          name: classInfo.name,
          time: classInfo.time,
          day: classInfo.day,
          duration: classInfo.duration,
          instructor: classInfo.instructor,
          description: classInfo.description,
          spotsAvailable: spotsLeft,
          totalCapacity: classInfo.capacity,
        };
      }
    }

    response.setStatusCode(200);
    response.setBody({
      success: true,
      message: "Available classes at NightOwl Fitness",
      classes: availableClasses,
    });

    callback(null, response);
  } catch (error) {
    console.error("Error fetching classes:", error);
    response.setStatusCode(500);
    response.setBody({
      success: false,
      error: "Failed to fetch classes",
    });
    callback(null, response);
  }
};
