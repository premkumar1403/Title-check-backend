const mongoose = require("mongoose");
const stringSimilarity = require("string-similarity");

const fileschema = new mongoose.Schema({
  Title: { type: String},
  Author_Mail: [{ Author_Mail: { type: String } }],
  Conference: [
    {
      Conference_Name: { type: String},
      Decision_With_Commends: { type: String },
    },
  ],
});

const file = mongoose.model("Excel", fileschema);

const fileModel = {
  //Function checks title is exist or not
  checkTitleExist: async (payload) => {
    const { Title, Author_Mail, Conference_Name, Decision_With_Commends } =
      payload;
    
    let savedFile = null;
    const existingFile = await file.findOne({ Title });
    const title_score = await file.find({ Title: { $regex: Title, $options: "i" }, });
    // for (let item of title_score) {
    //   const score = stringSimilarity.compareTwoStrings(item.Title, Title);
    //   if (score>0.7) {
    //     console.log(`${item.Title}`,+score);
    //   }
      
    // }
    if (existingFile) {
      const authorExists = existingFile.Author_Mail.some(
        (author) => author.Author_Mail === Author_Mail
      );

      if (authorExists) {
        const conferenceIndex = existingFile.Conference.findIndex(
          (conf) => conf.Conference_Name === Conference_Name
        );

        if (conferenceIndex !== -1) {
          if (Decision_With_Commends && Decision_With_Commends.trim() !== "") {
            existingFile.Conference[conferenceIndex].Decision_With_Commends =
              Decision_With_Commends;
          } else {
            console.log("Empty decision — keeping old value");
          }
        } else {
          existingFile.Conference.push({
            Conference_Name,
            Decision_With_Commends,
          });
        }
      } else {
        existingFile.Author_Mail.push({ Author_Mail });

        const conferenceIndex = existingFile.Conference.findIndex(
          (conf) => conf.Conference_Name === Conference_Name
        );

        if (conferenceIndex !== -1) {
          if (Decision_With_Commends && Decision_With_Commends.trim() !== "") {
            existingFile.Conference[conferenceIndex].Decision_With_Commends =
              Decision_With_Commends;
          } else {
            console.log("Empty decision — keeping old value");
          }
        } else {
          existingFile.Conference.push({
            Conference_Name,
            Decision_With_Commends,
          });
        }
      }

      savedFile = await existingFile.save();
      return savedFile;
    } else {
      const newfile = await file.create([
        {
          Title,
          Author_Mail: [{ Author_Mail }],
          Conference: [
            {
              Conference_Name,
              Decision_With_Commends,
            },
          ],
        },
      ]);
      return newfile;
    }
  },

  //Record creation
  createField: async (payload) => {
    return await fileModel.checkTitleExist(payload);
  },

  //getting a file
  getFile: async () => {
    return await file.find();
  },

  getPaginatedFiles: async (searchTerm, page, limit) => {
    const skip = (page - 1) * limit;
    const query = {
      $or: [
        { Title: { $regex: searchTerm, $options: "i" } },
        { "Conference.Conference_Name": { $regex: searchTerm, $options: "i" } },
      ],
    };
    const totalCount = await file.countDocuments(query);
    const results = await file.find(query).skip(skip).limit(limit);
    return { results, totalCount };
  },
  //search with title
  searchTitle: async (Title) => {
    return await file.find({
      Title: { $regex: Title, $options: "i" },
    });
  },
};

module.exports = fileModel;
