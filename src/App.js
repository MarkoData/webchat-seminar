import { useCallback, useEffect, useState } from "react";
import "./App.css";

function App() {
  const [drone, setDrone] = useState();
  const [messageEvents, setMessageEvents] = useState([]);
  const [user, setUser] = useState();
  const [membersArray, setMembersArray] = useState([]);
  const [typeMessage, setTypeMessage] = useState("");

  const getRandomColor = () => {
    var randomColorNumber = Math.floor(Math.random() * 16777215).toString(16);
    return "#" + randomColorNumber;
  };

  const setupRomm = useCallback((drone) => {
    drone.on("open", (error) => {
      //Connection has been opend if no error
    });
    const room = drone.subscribe("observable-markochat");
    room.on("open", (error) => {
      if (error) {
        return console.error(error);
      }
    });
    room.on("members", function (members) {
      setMembersArray(members);
    });
    room.on("member_join", (member) => {
      setMembersArray((prevVal) => [...prevVal, member]);
      setMessageEvents((prevVal) => [
        ...prevVal,
        { data: "Joined chat!", member },
      ]);
      const element = document.getElementById("message-list");
      setTimeout(() => (element.scrollTop = element.scrollHeight), 200);
    });
    room.on("member-leave", (member) => {
      setMembersArray((prevVal) => [
        prevVal.filter((currentMember) => currentMember.id !== member.id),
      ]);
      setMessageEvents((prevVal) => [
        ...prevVal,
        { data: "Left chat!", member },
      ]);
      const element = document.getElementById("message-list");
      setTimeout(() => (element.scrollTop = element.scrollHeight), 200);
    });

    room.on("message", (event) => {
      setMessageEvents((prevVal) => [...prevVal, event]);
      const element = document.getElementById("message-list");
      setTimeout(() => (element.scrollTop = element.scrollHeight), 200);
    });
  }, []);

  useEffect(() => {
    if (user) {
      const tempdrone = new window.Scaledrone("of8QzmLaDh0vOTIs", {
        data: user,
      });
      setDrone(tempdrone);
      setupRomm(tempdrone);
    }
  }, [user, setupRomm]);

  const sendMessage = (e) => {
    e.preventDefault();
    drone.publish({ room: "observable-markochat", message: typeMessage });
    setTypeMessage("");
  };

  const onFinishUserInput = (e) => {
    e.preventDefault();
    if (e.target.elements.username.value) {
      setUser({
        username: e.target.elements.username.value,
        color: getRandomColor(),
      });
    } else {
      window.alert("please enter userbname!");
    }
  };
  return !user ? (
    <div className="login-form">
      <form className="login-form" onSubmit={onFinishUserInput}>
        <p>Please insert your username</p>
        <input name="username" className="username-input" type="text"></input>
        <br />
        <button type="submit" className="send-button">
          Enter chat
        </button>
      </form>
    </div>
  ) : (
    <div className="app">
      <div className="chat-header">
        <div>Logged in as {user.username}</div>
        <div>Current active users: {membersArray.length}</div>
      </div>
      <div className="chat-window">
        <ul id="message-list" className="messages-list">
          {messageEvents.map((messageEvent, i) => {
            if (messageEvent?.member?.clientData?.username === user.username) {
              return (
                <div key={i} className="chat-message-current-user">
                  <div className="message-content">{messageEvent.data}</div>
                </div>
              );
            }
            return (
              <li key={i} className="chat-message">
                {(i === 0 ||
                  (i > 0 &&
                    messageEvent?.member?.clientData?.username !==
                      messageEvents[i - 1]?.member?.clientData?.username)) && (
                  <div className="message-username">
                    {messageEvent?.member?.clientData?.username}
                  </div>
                )}
                <div
                  className="message-content"
                  style={{ backgroundColor: user.color }}
                >
                  {messageEvent.data}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="input-window">
        <form onSubmit={sendMessage}>
          <input
            id="message"
            name="message"
            type="text"
            className="input-field"
            value={typeMessage}
            onChange={(e) => setTypeMessage(e.target.value)}
          ></input>
          <button type="submit" className="send-button">
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
