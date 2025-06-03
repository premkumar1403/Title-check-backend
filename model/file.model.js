const mongoose = require("mongoose");
const stringSimilarity = require("string-similarity");

const fileschema = new mongoose.Schema({
  Title: { type: String, index: true },
  Author_Mail: [{ Author_Mail: { type: String } }],
  Conference: [
    {
      Conference_Name: { type: String, index: true },
      Decision_With_Commends: { type: String },
      Precheck_Commends: { type: String },
      Firstset_Commends: { type: String },
    },
  ],
});

// Compound indexes for better query performance
fileschema.index({ Title: 1, "Author_Mail.Author_Mail": 1 });
fileschema.index({ Title: "text", "Conference.Conference_Name": "text" });

const file = mongoose.model("Conference_Data", fileschema);

const fileModel = {
  //Function checks title is exist or not
  checkTitleExist: async (payload) => {
    const {
      Title,
      Author_Mail,
      Conference_Name,
      Decision_With_Commends,
      Precheck_Commends,
      Firstset_Commends,
    } = payload;

    let savedFile = null;
    const existingFile = await file.findOne({ Title }, { __v: 0 }).lean();

    if (existingFile) {
      const authorExists = existingFile.Author_Mail.some(
        (author) => author.Author_Mail === Author_Mail
      );

      let updateOperations = {};
      let hasMultipleOperations = false;

      if (authorExists) {
        const conferenceIndex = existingFile.Conference.findIndex(
          (conf) => conf.Conference_Name === Conference_Name
        );

        if (conferenceIndex !== -1) {
          if (Decision_With_Commends && Decision_With_Commends.trim() !== "") {
            updateOperations.$set = {
              [`Conference.${conferenceIndex}.Decision_With_Commends`]:
                Decision_With_Commends,
              [`Conference.${conferenceIndex}.Precheck_Commends`]:
                Precheck_Commends,
              [`Conference.${conferenceIndex}.Firstset_Commends`]:
                Firstset_Commends,
            };
          }
        } else {
          updateOperations.$push = {
            Conference: {
              Conference_Name,
              Decision_With_Commends,
              Precheck_Commends,
              Firstset_Commends,
            },
          };
        }
      } else {
        const conferenceIndex = existingFile.Conference.findIndex(
          (conf) => conf.Conference_Name === Conference_Name
        );

        if (conferenceIndex !== -1) {
          updateOperations.$push = { Author_Mail: { Author_Mail } };
          if (Decision_With_Commends && Decision_With_Commends.trim() !== "") {
            updateOperations.$set = {
              [`Conference.${conferenceIndex}.Decision_With_Commends`]:
                Decision_With_Commends,
              [`Conference.${conferenceIndex}.Precheck_Commends`]:
                Precheck_Commends,
              [`Conference.${conferenceIndex}.Firstset_Commends`]:
                Firstset_Commends,
            };
            hasMultipleOperations = true;
          }
        } else {
          updateOperations.$push = {
            Author_Mail: { Author_Mail },
            Conference: {
              Conference_Name,
              Decision_With_Commends,
              Precheck_Commends,
              Firstset_Commends,
            },
          };
        }
      }

      if (Object.keys(updateOperations).length > 0) {
        if (hasMultipleOperations) {
          // Handle multiple operations separately for better performance
          await file.updateOne(
            { _id: existingFile._id },
            { $push: updateOperations.$push }
          );
          savedFile = await file.findByIdAndUpdate(
            existingFile._id,
            { $set: updateOperations.$set },
            { new: true, runValidators: false, lean: true }
          );
        } else {
          savedFile = await file.findByIdAndUpdate(
            existingFile._id,
            updateOperations,
            { new: true, runValidators: false, lean: true }
          );
        }
      } else {
        savedFile = existingFile;
      }

      return savedFile;
    } else {
      const newfile = await file.create({
        Title,
        Author_Mail: [{ Author_Mail }],
        Conference: [
          {
            Conference_Name,
            Decision_With_Commends,
            Precheck_Commends,
            Firstset_Commends,
          },
        ],
      });
      return newfile.toObject();
    }
  },

  //Record creation
  createField: async (payload) => {
    return await fileModel.checkTitleExist(payload);
  },

  //getting a file
  getFile: async () => {
    return await file.find().lean();
  },

  getPaginatedFiles: async (searchTerm, page, limit) => {
    const skip = (page - 1) * limit;
    const query = searchTerm
      ? {
          $text: { $search: searchTerm },
        }
      : {};

    const [results, totalCount] = await Promise.all([
      file.find(query).skip(skip).limit(limit).lean(),
      file.countDocuments(query),
    ]);

    return { results, totalCount };
  },

  //search with title
  searchTitle: async (Title) => {
    return await file
      .find({
        Title: { $regex: Title, $options: "i" },
      })
      .lean();
  },
};

module.exports = fileModel;
