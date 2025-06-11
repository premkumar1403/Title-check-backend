const mongoose = require("mongoose");
const stringSimilarity = require("string-similarity");


const fileschema = new mongoose.Schema({
  Title: { type: String, index: true },
  Author_Mail: [{ Author_Mail: { type: String } }],
  Conference: [
    {
      Conference_Name: { type: String, index: true },
      Decision_With_Comments: { type: String },
      Precheck_Comments: { type: String },
      Firstset_Comments: { type: String },
    },
  ],
}, {
  timestamps: true
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
      Decision_With_Comments,
      Precheck_Comments,
      Firstset_Comments,
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
          if (Decision_With_Comments && Decision_With_Comments.trim() !== "") {
            updateOperations.$set = {
              [`Conference.${conferenceIndex}.Decision_With_Comments`]:
                Decision_With_Comments,
              [`Conference.${conferenceIndex}.Precheck_Comments`]:
                Precheck_Comments,
              [`Conference.${conferenceIndex}.Firstset_Comments`]:
                Firstset_Comments,
            };
          }
        } else {
          updateOperations.$push = {
            Conference: {
              Conference_Name,
              Decision_With_Comments,
              Precheck_Comments,
              Firstset_Comments,
            },
          };
        }
      } else {
        const conferenceIndex = existingFile.Conference.findIndex(
          (conf) => conf.Conference_Name === Conference_Name
        );

        if (conferenceIndex !== -1) {
          updateOperations.$push = { Author_Mail: { Author_Mail } };
          if (Decision_With_Comments && Decision_With_Comments.trim() !== "") {
            updateOperations.$set = {
              [`Conference.${conferenceIndex}.Decision_With_Comments`]:
                Decision_With_Comments,
              [`Conference.${conferenceIndex}.Precheck_Comments`]:
                Precheck_Comments,
              [`Conference.${conferenceIndex}.Firstset_Comments`]:
                Firstset_Comments,
            };
            hasMultipleOperations = true;
          }
        } else {
          updateOperations.$push = {
            Author_Mail: { Author_Mail },
            Conference: {
              Conference_Name,
              Decision_With_Comments,
              Precheck_Comments,
              Firstset_Comments,
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
    } else {
      const newfile = await file.create({
        Title,
        Author_Mail: [{ Author_Mail }],
        Conference: [
          {
            Conference_Name,
            Decision_With_Comments,
            Precheck_Comments,
            Firstset_Comments,
          },
        ],
      });
      savedFile = newfile.toObject();
    }
  },

  //Record creation
  createField: async (payload) => {
    const { Title } = payload;
    const result = await fileModel.checkTitleExist(payload);
    const existingFile = await file.findOne({ Title }, { __v: 0 }).lean();
    return existingFile;
  },

  //getting a file
  getFile: async () => {
    return await file.find().lean();
  },

  getPaginatedFiles: async (searchTerm, page, limit) => {
    const skip = (page - 1) * limit;
    const query = searchTerm
      ? {
        Title: { $regex: searchTerm, $options: "i" },
      }
      : {};

    const [results, totalCount] = await Promise.all([
      file.find(query).skip(skip).limit(limit).lean(),
      file.countDocuments(query),
    ]);

    return { results, totalCount };
  },

  //search with title
  searchTitle: async (payload) => {
    const { Title } = payload;
    return await file.findOne({ Title }, { __v: 0 }).lean();
  },


  confNameFilter: async () => {
    const confname = new Set();
    const filtered = await file.find();
    for (let item of filtered) {
      if (item.Conference[0].Conference_Name) {
        confname.add(item.Conference[0].Conference_Name);
      }
    }
    return confname;
  },

  confNameUpload: async (name, page, limit) => {
    const skip = (page - 1) * limit;
    const [response, totalCount] = await Promise.all([file.find({ "Conference.Conference_Name": `${name}` }, { __v: 0 })
    .skip(skip).limit(limit).lean(), file.countDocuments({"Conference.Conference_Name":`${name}`})]);
    return { response, totalCount };
  },

  confCmdUpload: async (cmd, page, limit) => {
    const skip = (page-1)*limit;
    const [response,totalCount] = await Promise.all([file.find({ "Conference.Decision_With_Comments": `${cmd}` }, { __v: 0 })
    .skip(skip).limit(limit).lean(),file.countDocuments({"Conference.Decision_With_Comments":`${cmd}`})]);
    return {response,totalCount};
  }
}

module.exports = fileModel;
