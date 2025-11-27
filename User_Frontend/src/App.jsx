import { useEffect, useState } from 'react'
import axios from 'axios'

function App() {



const users = async function () {
  useEffect(() => {
    axios.get("https://4f8dmfn1-5000.inc1.devtunnels.ms").then((res) => {
      console.log(res.data.message);
    });
  }, []);
} 

console.log(users());
return (
  <div>
    <h1>hello</h1>
  </div>
)

}
export default App
