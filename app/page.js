'use client';
import WorkflowBuilder from "../components/WorkflowBuilder";

import { Button, Grid } from "@mui/material";
import { useState } from "react";

export default function HomePage() {
  return <WorkflowBuilder />;
}



// function HomePage() {

//   const [Fields, setFields] = useState([""]);

//   const handleAddField = () => {
//     setFields([...Fields, ""]);
//   };

//   const removeField = (index) => {
//     const updatedFields = [...Fields];
//     updatedFields.splice(index, 1);
//     setFields(updatedFields);
//   };

//   const handleFieldChange = (index, value) => {
//     const updatedFields = [...Fields];
//     updatedFields[index] = value;
//     setFields(updatedFields);
//     console.log(Fields,"jjjjjjjjjjjjjjjjjj")
//   }


  
//   const data=[
//     {
//       id: 1,
//     },
//     {
//       id: 2,
//     }, {
//       id: 3,
//     }, {
//       id: 4,
//     }
//   ]
//   return (
//     <>

//     <div style={{display:"flex",flexDirection:"row",flexWrap:"wrap", itemsAlign:"center",justifyContent:"space-between",padding:"10px"}}>
//       {data.map((item)=>{
//         return (<div key={item.id}>
       
//   <Grid size={{ xs: 12, sm: 4, md: 4 }}   style={{
//     border: "1px solid black",
//     margin: "10px",
//     height: "400px",
//     width: "400px",
//     backgroundColor: "yellow",
//     color: "black",
//     textAlign: "center"
//   }}>
//     {item.id}
//   </Grid>
  
//         </div>)
//       })}
//   </div>

// <div style={{display:"flex",flexDirection:"column",flexWrap:"wrap", itemsAlign:"center",justifyContent:"space-between",padding:"10px"}}>


// {Fields?.map((field, index) => (
//         <div key={index}>
//           <input
//             type="text"
//             value={field }
//             onChange={(e) => handleFieldChange(index, e.target.value)}
//           />
//         <Button variant="tonal" onClick={() => removeField(index)}>Remove</Button>
//         </div>
//       ))}
//       <Button variant="contained" onClick={handleAddField}>Add Field</Button>
// </div>
//      </> )
// }

// export default HomePage;