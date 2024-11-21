# /api Folder
  index file in /api folder is to solve express framework - vercel deployment issues.

# Auth Folder
  after Authorize Grant it redirected to /Auth 
  1. The Index file is used to get Auth Code and send request access code generation.
  2. login file is incomplete - for future use.

# Public Folder
  All the HTML, CSS, and JavaScript files are place here. Because of Express Framework file structure.
  ## 1. Components Folder
      Custom Elements are Placed inside this folder
  ## 2. CSS Folder
      All Css Files are located here
  ## 3. JS Folder
      All JavaScript files are located here
  ## 4. Mappings Folder
      It Contain's a file that is used for Mapping Custom name's with API Response name.(Variable Name)
  ## 5. Static Folder
      It Contain's all the static files like Images, Videos, etc.,
  ## 6. Templates Folder
      All HTML are located here.

# Routes Folder
  It Contain's Back-End Files for creating endpoints
  Currently Used files
  ### 1. Meeting.js
      -- for ZOHO Meeting Endpoints
  ### 2. Mongodb.js
      -- for Mongodb Endpoints
  ### 3. Scope.js
      -- contain's all the required scopes
  ### 4. Zoho.js
      -- contain's access token generating logic's
  ### 5. ZohoMail.js
      -- contain's ZOHO Mail Endpoints
