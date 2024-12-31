"use client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function Home() {

  const [todoList, setTodoList] = useState([])
  const [addTodo, setAddTodo] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: ""
  })
  const [editData, setEditData] = useState({
    id:"",
    title: "",
    description: ""
  })
  const router=useRouter()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }
  const handleEditChange=(e)=>{
    setEditData({...editData,[e.target.name]:e.target.value})
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem("token")

    try {
      const res = await fetch("http://localhost:8080/api/todos", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `${token}`
        },
        body: JSON.stringify(formData)
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error)
      }
      setAddTodo(false)
      FetchTodos()
      setFormData({
        title: "",
        description: ""
      })
      console.log(data)
    } catch (error) {
      alert(error)
    }

  }

  const FetchTodos = async () => {
    const token = localStorage.getItem("token")
    if(!token){
      router.push("/login")
      return
    }
    try {
      const res = await fetch("http://localhost:8080/api/todos", {
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `${token}`
        }
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data)
      }
      if(data.length !==0){
        data.reverse()
      }
      setTodoList(data)
      console.log(data)
    } catch (error) {
      alert(error)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const handleDone = async (todoId) => {
    const token = localStorage.getItem("token")
    try {
      const res = await fetch(`http://localhost:8080/api/todos/${todoId}`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `${token}`
        },
        body: JSON.stringify({ completed: true })
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data)
      }
      FetchTodos()
      console.log(data)
    } catch (error) {
      alert(error)
    }
  }

  const handleDelete = async (todoId) => {
    const token = localStorage.getItem("token")
    try {
      const res = await fetch(`http://localhost:8080/api/todos/${todoId}`, {
        method: "DELETE",
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `${token}`
        }
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data)
      }
      FetchTodos()
      console.log(data)
    } catch (error) {
      alert(error)
    }
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token")
    try {
      const res = await fetch(`http://localhost:8080/api/todos/${editData.id}`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `${token}`
        },
        body:JSON.stringify({title:editData.title,description:editData.description})
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data)
      }
      setEditData({
        id:"",
        title:"",
        description:""
      })
      FetchTodos()
    } catch (error) {
      console.log(error)
      alert(error)
    }
  }

  const handleLogout=()=>{
    localStorage.removeItem("token")
    router.push("/login")
  }

  useEffect(() => {
    FetchTodos()
  }
  , [])


  return (
    <div style={{ position: "relative" ,height:"100vh",width:"100vw"}}>
      {editData.title==="" ?"" :<div style={{ position: "absolute", backgroundColor: "grey", zIndex: 1,opacity:"0.9", height: "100vh", width: "100vw" }}>
        <div>
          <div>
            <div className="d-flex flex-column justify-content-center align-items-center w-3" style={{opacity:"1"}}>
              <h1 >Update Task</h1>
              <form onSubmit={handleEditSubmit} style={{ border: "2px solid red", borderRadius: "2rem", width: "40vw", padding: "3vw 3vw 3vw 3vw", marginTop: "3vh", backgroundColor: "#ccccff" }}>
                <div className="mb-3">
                  <label htmlFor="title" className="form-label">Title</label>
                  <input type="text" name="title" value={editData.title} onChange={handleEditChange} className="form-control" id="username" />
                </div>
                <div className="mb-3">
                  <label htmlFor="description" className="form-label">Description</label>
                  <input type="text" name="description" value={editData.description} onChange={handleEditChange} className="form-control" id="firstname" />
                </div>
                <button type="submit" className="btn btn-primary">Submit</button>
              </form>
            </div>
          </div>  
        </div>
      </div>}
      {!addTodo ? <div className="d-flex gap-5 justify-content-center m-3">
        <div className="btn btn-warning"  onClick={()=>setAddTodo(true)}>Add task</div>
        <div className="btn btn-danger"  onClick={handleLogout}>Logout</div>
      </div>:<div>
        <div className="d-flex flex-column justify-content-center align-items-center w-3">
          <h1 >Create Task</h1>
          <form onSubmit={handleSubmit} style={{ border: "2px solid red", borderRadius: "2rem", width: "40vw", padding: "3vw 3vw 3vw 3vw", marginTop: "3vh", backgroundColor: "#ccccff" }}>
            <div className="mb-3">
              <label htmlFor="title" className="form-label">Title</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} className="form-control" id="username" />
            </div>
            <div className="mb-3">
              <label htmlFor="description" className="form-label">Description</label>
              <input type="text" name="description" value={formData.description} onChange={handleChange} className="form-control" id="firstname" />
            </div>
            <button type="submit" className="btn btn-primary">Submit</button>
          </form>
        </div>
      </div>}
      {/* {!addTodo ? <div className="d-flex justify-content-center"><div className="btn btn-warning"  onClick={()=>setAddTodo(true)}>Add task</div></div>
      :<div>
      </div>} */}
      <table className="table">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Title</th>
            <th scope="col">Description</th>
            <th scope="col">Completed</th>
            <th scope="col">CreatedAt</th>
          </tr>
        </thead>
        <tbody>
          {todoList.map((todo, index) => {
            return (<tr key={index}>
              <th scope="row">{todoList.length - index}</th>
              <td style={{textDecoration: todo.completed?"line-through":""}}>{todo.title}</td>
              <td style={{textDecoration: todo.completed?"line-through":""}}>{todo.description}</td>
              <td style={{textDecoration: todo.completed?"line-through":""}}>{todo.completed ? "True" : "False"}</td>
              <td style={{textDecoration: todo.completed?"line-through":""}}>{formatDate(todo.createdAt)}</td>
              <i onClick={() => setEditData({id:todo._id,title:todo.title,description:todo.description})} className="fa fa-pen" style={{cursor:"pointer"}}></i>
              <div onClick={() => handleDone(todo._id)} className="btn btn-success ms-3 me-3 p-1 ps-2 pe-2" style={{ height: "50%" }}>Done</div>
              <div onClick={() => handleDelete(todo._id)} className="btn btn-danger p-1 ps-2 pe-2">Delete</div>
            </tr>
            )
          })}

        </tbody>
      </table>
    </div>
  );
}
