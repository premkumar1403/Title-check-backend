const XLSX = require("xlsx");
const fileModel = require("../model/file.model");

const fileController = {
  createFile: async (req, res) => {
  const file = req.file.buffer;
  const page_num = parseInt(req.query.page) || 1;
  const paginated = req.query.paginated || false; 

  
  // const spaceRegex = /\s+/g;
  // const punctuationRegex = /[-'"/=.,:;]/g;

  function normalizeTitle(title, item) {
    if (!title) return;
    // if (!title || typeof title !== "string") {
    //   return res.status(400).json({
    //     Paper_ID: item.Paper_ID,
    //     success: false,
    //     message: "All fields must have valid data!",
    //   });
    // }
    return title
      .toLowerCase()
      .replace(/[-''"/=.,:;]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function normalizeAuthor(author, item) {
    if (!author) return;
    // if (!author || typeof author !== "string") {
    //   return res.status(400).json({
    //     Paper_ID: item.Paper_ID,
    //     success: false,
    //     message: "All fields must have valid data!",
    //   });
    // }
    return author
      .toLowerCase()
      .replace(/[-''"/=.,:;]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function normalizeName(name, item) {
    if (!name) return;
    // if (!name || typeof name !== "string") {
    //   return res.status(400).json({
    //     Paper_ID: item.Paper_ID,
    //     success: false,
    //     message: "All fields must have valid data!",
    //   });
    // }
    return name
      .toLowerCase()
      .replace(/[-''"/=.,:;]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function normalizeCmd(cmd, item) {
    if (!cmd) return;
    // if (!cmd || typeof cmd !== "string") {
    //   return res.status(400).json({
    //     Paper_ID: item.Paper_ID,
    //     success: false,
    //     message: "All fields must have valid data!",
    //   });
    // }
    return cmd
      .toLowerCase()
      .replace(/[-''"/=.,:;]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function normalizePrecheck(precheck) {
    if (!precheck) return "";
    return precheck
      .toLowerCase()
      .replace(/[-''"/=.,:;]/g, " ")
      .replace(/\s+/g, " ") 
      .trim();
  }

  function normalizeFirstset(firstset) {
    if (!firstset) return "";
    return firstset
      .toLowerCase()
      .replace(/[-''"/=.,:;]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  // Helper function to process a batch of items
  async function processBatch(items, processedTitles = new Set()) {
    const batchPromises = items.map(async (item) => {
      try {
        const payload = {
          Title: normalizeTitle(item.Title, item),
          Author_Mail: normalizeAuthor(item.Author_Mail, item),
          Conference_Name: normalizeName(item.Conference_Name, item),
          Decision_With_Comments: normalizeCmd(
            item.Decision_With_Comments,
            item
          ),
          Precheck_Comments: normalizePrecheck(item.Precheck_Comments),
          Firstset_Comments: normalizeFirstset(item.Firstset_Comments),
        };
        
        const result = await fileModel.createField(payload);

        // Only add to response if title hasn't been processed yet
        if (result && !processedTitles.has(result.Title)) {
          processedTitles.add(result.Title);
          return result;
        }
        return null;
      } catch (error) {
        console.log("error uploading files!" + error);
        return null;
      }
    });

    const batchResults = await Promise.all(batchPromises);
    return batchResults.filter((result) => result !== null);
  }

  try {
    const workbook = XLSX.read(file, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 0 });

    if (!data || data.length === 0) {
      return res.status(400).json({ message: "No data found in file!" });
    }

    const processedTitles = new Set(); // Track processed titles to avoid duplicates

    if (paginated) {
      // PAGINATED RESPONSE
      const page_size = 25;
      const start_index = (page_num - 1) * page_size;
      const end_index = start_index + page_size;
      const total_page = Math.ceil(data.length / page_size);

      // Only process the data needed for current page
      const pageData = data.slice(start_index, end_index);
      const response = await processBatch(pageData, processedTitles);

      // Process remaining data in background (fire and forget) only for first page
      if (page_num === 1 && data.length > page_size) {
        setImmediate(async () => {
          const remainingData = data.slice(page_size);
          const batchSize = 50;
          const backgroundProcessedTitles = new Set(processedTitles);

          for (let i = 0; i < remainingData.length; i += batchSize) {
            const batch = remainingData.slice(i, i + batchSize);
            try {
              await processBatch(batch, backgroundProcessedTitles);
            } catch (error) {
              console.log("background processing error: " + error);
            }
          }
        });
      }

      return res.status(201).json({
        paginated: true,
        page: page_num,
        page_size,
        total_records: data.length,
        total_page,
        current_page_records: response.length,
        response: response,
        message: "file uploaded to database successfully!",
      });

    } else {
      // NON-PAGINATED RESPONSE - Process all data
      const batchSize = 50;
      const allResults = [];

      // Process all data in batches to avoid memory issues
      for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);
        const batchResults = await processBatch(batch, processedTitles);
        allResults.push(...batchResults);
      }

      return res.status(201).json({
        paginated: false,
        total_records: data.length,
        processed_records: allResults.length,
        response: allResults,
        message: "file uploaded to database successfully!",
      });
    }

  } catch (error) {
    console.log("Error processing file: " + error);
    return res.status(500).json({ message: "Internal server error!" });
  }
},

  //with pagination title query
  getFile: async (req, res) => {
    try {
      const { q = "", page = 1, limit = 25 } = req.query;

      const searchTerm = q
        .toLowerCase()
        .replace(/[-''"/=.,:;]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      console.log(searchTerm);

      const currentPage = parseInt(page);
      const itemsPerPage = parseInt(limit);

      const { results, totalCount } = await fileModel.getPaginatedFiles(
        searchTerm,
        currentPage,
        itemsPerPage
      );
      const totalPages = Math.ceil(totalCount / itemsPerPage);

      res.status(200).json({
        page: currentPage,
        total_page: totalPages,
        data: results,
        message: "Files fetched successfully",
      });
    } catch (error) {
      console.error("Error in getFile:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  //without pagination title query
  searchTitle: async (req, res) => {
    const title = req.query.Title?.toLowerCase()
      .replace(/[-''"/=.,:;]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    try {
      const response = await fileModel.searchTitle({ Title: title });
      res.status(200).json({
        data: response,
        message: "Title matched files fetched successfully!",
      });
    } catch (error) {
      res.status(400).json({
        message:
          "user entered invalid title ensure the spelling and spaces carefully!",
      });
    }
  },


  //fetching conference name controller
  confNameFilter:async(req,res)=>{
    try {
      const nameArray=[];
      const response = await fileModel.confNameFilter();
      nameArray.push(...response); 
      res.status(200).json({
        data:nameArray,
        message:"conference names fetched successfully!"});
    } catch (error) {
       res.status(500).json({message:"there is no conference name available!"});
    }
  },

confNameUpload:async(req,res)=>{
   const {page = 1, limit = 25 } = req.query;
   const {confname}=req.body;

   try {
    const currentPage = parseInt(page);
    const itemsPerPage = parseInt(limit);
    const {response,totalCount}=await fileModel.confNameUpload(confname,currentPage,itemsPerPage);
    const totalPages = Math.ceil(totalCount / itemsPerPage);
    res.status(200).json({
      page:currentPage,
      total_pages:totalPages,
      data:response,
      message:"selected conference name datas fetched successfully!"});
   } catch (error) {
    res.status(500).json({message:"there is no conference available!"});
   }
  },


confCmdUpload:async(req,res)=>{
const { page = 1, limit = 25 }=req.query;
const {comment} = req.body;
try {
  const currentPage = parseInt(page);
  const itemsPerPage = parseInt(limit);
  const {response,totalCount} = await fileModel.confCmdUpload(comment,currentPage,itemsPerPage);
  const totalPages = Math.ceil(totalCount/itemsPerPage);
  res.status(200).send({
    page:currentPage,
    total_pages:totalPages,
    data:response,
    message:"results fetched successfully based on comments!"});
} catch (error) {
  res.status(500).json({message:"there is no conference data available"});
}
},

};
module.exports = fileController;
