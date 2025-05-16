const XLSX = require("xlsx")
const fileModel = require("../model/file.model")



const fileController = {
    createFile: async (req, res) => {
        const file = req.file.buffer;
        try {
            const workbook = XLSX.read(file, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(worksheet, { header: 0 });
            const promise = new Promise((resolve, reject) => {
                if (!data) {
                    reject();
                }
                else {
                    for (const item of data) {
                      try {
                        const payload = {
                          Title: item.Title,
                          Author_Mail: item.Author_Mail,
                          Conference_Name: item.Conference_Name,
                          Decision_With_Commends: item.Decision_With_Comments,
                        };

                        fileModel.createFiled(payload);
                        resolve();
                      } catch (error) {
                        res
                          .status(400)
                          .jsn({ message: "Error uploading on data" });
                      }
                    }
                }
            })
            
            res.status(201).json({
              message: "file uploaded to database successfully!",
            });
           
        } catch (error) {
            res.status(400).json({ message: "Error uploading files!" });
        }
    },

    updateField: async(req,res) => {
        
    },

    searchEmail: async(req,res) => {
        const { Author_Mail } = req.body;
        try {
            const response_data = await fileModel.searchEmail(Author_Mail);
            res.status(200).json({ data: response_data, message: "Details fetched for the given mailID" });
        } catch (error) {
            res.status(400).message("Error fetching Details!");
        }
    },

    searchTitle: async(req,res) => {
        const { Title } = req.body;
        try {
            const response_data = await fileModel.searchTitle(Title);
            res.status(200).json({ data: response_data, message: "Details fetched successfully!" });
        } catch (error) {
            res.status(400).message("Error fetching Details!");
        }
    },
    searchConference: async(req,res) => {
        const { Conference_Name } = req.body;
        try {
            const response_data = await fileModel.searchConference(Conference_Name);
            res.status(200).json({ data: response_data, message: "Details fetched successfully" });
        } catch (error) {
            res.stauts(400).json({ message: "Error fetching Details!" });
        }
    }
}
module.exports = fileController;