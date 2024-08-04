/* page.tsx */
"use client"; // Enable client-side rendering
import { useState, useEffect, useCallback } from "react"; // Import necessary React hooks
import { 
  Select, 
  MenuItem, 
  TextField, 
  Button, 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  IconButton, 
  Paper 
} from "@mui/material"; // Import Material-UI components
import DeleteIcon from '@mui/icons-material/Delete'; // Import delete icon
import { useDropzone } from "react-dropzone"; // Import useDropzone hook for file drag-and-drop

const taskTypes = ['Feature', 'Fix', 'Refactor', 'Question', 'Blog', 'Others']; // Task types array

// Function to get default text based on task type
const getDefaultText = (taskType: string) => {
  switch (taskType) {
    case 'Fix':
      return "You are tasked to fix a bug. Instructions are as follows:\n\n";
    case 'Refactor':
      return "You are tasked to do a code refactoring. Instructions are as follows:\n\n";
    case 'Question':
      return "You are tasked to answer a question:\n\n";
    case 'Blog':
      return "You are tasked to write a blog post. Instructions are as follows:\n\n";
    case 'Others':
      return "\n\n";
    default:
      return "You are tasked to implement a feature. Instructions are as follows:\n\n";
  }
};

// Function to generate the full prompt
const generateFullPrompt = (taskType: string, instructions: string, files: { name: string, content: string }[]) => {
  let prompt = instructions + "\n\n";
  prompt += "Instructions for the output format:\n";
  prompt += "- Output code without descriptions, unless it is important.\n";
  prompt += "- Minimize prose, comments and empty lines.\n";
  prompt += "- Only show the relevant code that needs to be modified. Use comments to represent the parts that are not modified.\n";
  prompt += "- Make it easy to copy and paste.\n";
  prompt += "- Consider other possibilities to achieve the result, do not be limited by the prompt.\n\n";
  prompt += "Code Context:\n";
  files.forEach(file => {
    prompt += `File: ${file.name}\n`;
    prompt += "```\n" + file.content + "\n```\n\n";
  });
  return prompt;
};

// Home component
const Home = () => {
  const [taskType, setTaskType] = useState<string>(''); // State for selected task type
  const [instructions, setInstructions] = useState<string>(''); // State for task instructions
  const [files, setFiles] = useState<{ name: string, content: string }[]>([]); // State for uploaded files
  const [prompt, setPrompt] = useState<string>(''); // State for generated prompt

  // Effect to set default instructions when task type changes
  useEffect(() => {
    if (taskType) {
      setInstructions(getDefaultText(taskType));
    }
  }, [taskType]);

  // Callback function to handle file drops
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const filePromises = acceptedFiles.map(file =>
      file.text()
        .then(content => ({ name: file.name, content })) // Read file content
        .catch(error => {
          console.error(`Error reading file ${file.name}:`, error);
          return null;
        })
    );

    Promise.all(filePromises)
      .then(filesWithContent => {
        const validFiles = filesWithContent.filter(file => file !== null) as { name: string, content: string }[];
        setFiles(prevFiles => [...prevFiles, ...validFiles]); // Update state with valid files
      })
      .catch(error => console.error('Error processing files:', error));
  }, []);

  // useDropzone hook for file drag-and-drop functionality
  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    multiple: true,
    noClick: true,
    noKeyboard: true,
  });

  // Callback function to remove a file
  const removeFile = useCallback((fileName: string) => {
    setFiles(files => files.filter(file => file.name !== fileName));
  }, []);

  // Callback function to generate the prompt
  const generatePrompt = useCallback(() => {
    const fullPrompt = generateFullPrompt(taskType, instructions, files);
    setPrompt(fullPrompt); // Set the generated prompt in state
  }, [taskType, instructions, files]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Paper elevation={3} className="bg-gray-900 p-6 rounded-lg text-white w-full max-w-xl">
        <Typography variant="h4" gutterBottom>AI Prompt</Typography>
        <Select
          value={taskType}
          onChange={(e) => setTaskType(e.target.value as string)}
          displayEmpty
          fullWidth
          margin="dense"
          className="text-white"
        >
          <MenuItem value="" disabled>Select Task Type</MenuItem>
          {taskTypes.map((type) => (
            <MenuItem key={type} value={type}>{type}</MenuItem>
          ))}
        </Select>
        <TextField
          label="Task Instructions"
          multiline
          rows={4}
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          fullWidth
          margin="normal"
          InputLabelProps={{ className: 'text-white' }}
          InputProps={{ className: 'text-white' }}
        />
        <Box {...getRootProps()} p={2} border="1px dashed grey" textAlign="center" margin="normal">
          <input {...getInputProps()} />
          <Typography>Drag & drop files or folders here, or click to select files</Typography>
          <Button onClick={open} variant="contained" color="primary">Select Files</Button>
        </Box>
        {files.length > 0 && (
          <Box mt={2} p={2} border="1px solid grey">
            <Typography variant="h6">Selected Files</Typography>
            <List>
              {files.map((file, index) => (
                <ListItem key={index} secondaryAction={
                  <IconButton edge="end" aria-label="delete" onClick={() => removeFile(file.name)}>
                    <DeleteIcon className="text-white" />
                  </IconButton>
                }>
                  <ListItemText primary={file.name} className="text-white" />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
        <Button variant="contained" color="primary" onClick={generatePrompt} fullWidth>
          Generate Prompt
        </Button>
        {prompt && (
          <Box mt={3} p={2} border="1px solid grey">
            <Typography variant="h6">Generated Prompt</Typography>
            <Typography style={{ whiteSpace: 'pre-wrap' }}>{prompt}</Typography>
            <Button onClick={() => navigator.clipboard.writeText(prompt)} variant="contained" color="secondary">
              Copy
            </Button>
          </Box>
        )}
      </Paper>
    </main>
  );
};

export default Home;
