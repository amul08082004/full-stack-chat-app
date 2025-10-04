import {useChatStore} from "../store/useChatStore"
import Sidebar from "../components/Sidebar"
import style from "./HomePage.module.css"
import NoChatSelected from "../components/NoChatSelected"
import ChatContainer from "../components/ChatContainer"
const HomePage=()=>{
  const{selectedUser}=useChatStore()
  return(
    <>
    <div className={style["holu"]}>
      <Sidebar/>
   {selectedUser?<ChatContainer/>:<NoChatSelected/>}
    </div>
    </>
  )
}

export default HomePage;