const XLSX = require("xlsx");
const fileModel = require("../model/file.model");

const fileController = {
  createFile: async (req, res) => {
    const file = req.file.buffer;
    const page_num = req.query.page || 1;
    function normalizeTitle(title) {
      return title?.replace(/\s+/g, " ").trim().toLowerCase();
    }
    try {
      const workbook = XLSX.read(file, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 0 });
      if (!data || data.length === 0) { 
        return null;
      } else {
        const response = [];
        for (const item of data) {
          try {
            const payload = {
              Title: normalizeTitle(item.Title),
              Author_Mail: item.Author_Mail,
              Conference_Name: item.Conference_Name,
              Decision_With_Commends: item.Decision_With_Commends,
            };
            
            const responses = await fileModel.createField(payload);
            response.push(responses);
            
          } catch (error) {
            console.log("error uploading files!" + error);
          }
        }
        //pagination code 
        const page = page_num;
        const page_size = 25;
        const start_index = (page - 1) * page_size;
        const end_index = start_index + page_size;
        const total_page = Math.ceil(response.length / page_size);
        const paginated_data = response.slice(start_index, end_index);
        return res.status(201).json({
          page,total_page,response:paginated_data,
          message: "file uploaded to database successfully!",
        });
      }
    } catch (error) {
      return res.status(500).json({ message: "Internal server error!" });
    }
  },

  getFile: async (req, res) => {
    const page_num = req.query.page || 1;
        try {
          const response = await fileModel.getFile();
          const page = page_num;
          const page_size = 25;
          const start_index = (page - 1) * page_size;
          const end_index = start_index + page_size;
          const total_page = Math.ceil(response.length / page_size);
          const paginated_data = response.slice(start_index, end_index);
          res.status(200).json({ page,total_page,data:paginated_data, message: "files fetched successfully" });
        } catch (error) {
          res.status(400).json({ message: "No records found!" });
        }
  },
  
  searchTitle: async(req,res) => {
    const Title = req.query.Title.toLowerCase();
    try {
      const response = await fileModel.searchTitle(Title);
      res.status(200).json({data:response,message:"Title matched files fetched successfully!"})
    } catch (error) {
      res.status(400).json({message:"user entered invalid title ensure the spelling and spaces carefully!"})
    }
  }
      
};

module.exports = fileController;
