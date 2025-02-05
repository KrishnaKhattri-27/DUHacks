import "./App.css";
import { Routes, Route,useNavigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import { useEffect, useState } from "react";
import Police from "./pages/Police";
// import Traffic from "./components/Traffic/Traffic";
import Traffic from "./pages/Traffic";
import PreLoader from "./components/preLoader/PreLoader";
import { io } from "socket.io-client";


function App() {
  const nav=useNavigate()
  const [loader, setLoader] = useState(true);
  const [isloggedin, setLoggedin] = useState(false);
  const [status, setStatus] = useState(false);
  const [userData,setUserData]=useState({
    name:"",
    password:""
  })
  const [messages, setMessages] = useState({
    img: "",
    title: "",
  });

  const alert_message =
    "WARNING..!! Suspicious Activity Detected. Confirm if the detected emergence is an actual emergency or not.";

  const handleSubmit = (e) => {
    e.preventDefault();
    // const name=e.target.name.value;
    // const password=e.target.password.value;
    // setUserData({name,password})
    setLoggedin(true)
  };

  useEffect(() => {
    nav("/login")
    setTimeout(() => {
      setLoader(false);
    }, 3000);

  }, []);

  const passData=async()=>{
    const response = await fetch("https://mern-crud-server1.onrender.com/user/login", {
      method: "POST",
      body: JSON.stringify(userData),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const json = await response.json();
      if (response.ok) {
        localStorage.setItem("user", JSON.stringify(json.data));
        setLoggedin(true);
      } else {
        console.log(json.error);
      }
  }

  useEffect(()=>{
    if(userData.name==="" || userData.password==="")
    return;
      passData();
  },[userData])
  const sendTrafficData = (number) => {
    const d = new Date();
    let minutes = d.getMinutes();
    let hours = d.getHours();
    let dateString = hours + ":" + minutes;
    console.log(dateString);
  };

  useEffect(() => {
    const socket = io("http://localhost:8000");
    socket.on("messageFromServer", (message, image_url) => {
      console.log(message, image_url);
      setMessages({
        img: image_url,
        title: message,
      });
      setStatus(true);
    });
    socket.on("messageFromTraffic", (number) => {
      console.log("Traffic on Server is ", number);
      sendTrafficData(number);
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  const sendNotification = async (e) => {
    console.log("Notification Func called");
    const temp = {
      message: e,
    };
    const response = await fetch("http://localhost:8000/v1/sendNotification", {
      method: "POST",
      body: JSON.stringify(temp),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      console.log(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  };

  // setTimeout(() => {
  //   setStatus(true);
  // }, 10000);

  useEffect(() => {
    if (!status) return;

    sendNotification(alert_message);
  }, [status]);


  const yesHandler = async (e) => {
    let sub, cont;
    if (e === "YES") {
      sub = "Immediate Alert - Confirmed Suspicious Activity";
      cont = `Dear [Higher Authority's Name],\n\nI urgently report the detection of suspicious activity by our AI surveillance system. [Monitor's Name] has verified and marked the activity as confirmed, triggering an alarm in the designated.\nPlease find the attached suspicious image. area\n\nRegards\nTechnical Team\n\nLink:${messages.img}
        `;
    } else {
      sub = "Clarification - Resolved Alert on Detected Suspicious Activity";
      cont = `"Dear [Higher Authority's Name],\n\nI wish to update you that our AI surveillance system initially detected suspicious activity. However, upon review, [Monitor's Name] has marked the activity as a false positive. No further action is required at this time\nPlease find the attached suspicious image. area\n\nRegards\nTechnical Team\n\nLink:${messages.img}`;
    }
    const temp = { sub: sub, cont: cont };
    const response = await fetch("http://localhost:8000/v1/sendMail", {
      method: "POST",
      body: JSON.stringify(temp),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      console.log(`HTTP error! Status: ${response.status}`);
    }
    setStatus(false)
    return response.json();
  };


  return loader ? (
    <PreLoader />
  ) : (
    <div className="">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        {/* <Route
          path="/login"
          element={
            <Login handleSubmit={handleSubmit} isloggedin={isloggedin} />
          }
        />
        <Route
          path="/police"
          element={<Police messages={messages} status={status} yesHandler={yesHandler} />}
        />
        <Route path="/traffic" element={<Traffic />} /> */}
      </Routes>
    </div>
  );
}

export default App;
