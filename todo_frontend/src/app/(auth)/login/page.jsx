"use client"

import Link from "next/link";
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function Login() {

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    })
    const router = useRouter();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            const res = await fetch("http://localhost:8080/api/auth/login", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })
            const data = await res.json()
            if (!res.ok) {
                alert(data)
            }
            localStorage.setItem("token", data.token)
            console.log(data)
            router.push("/")
        } catch (error) {
            alert(error)
        }

    }

    return (
        <div className="d-flex flex-column justify-content-center align-items-center w-3">
            <h1 >Login</h1>
            <form onSubmit={handleSubmit} style={{ border: "2px solid red", borderRadius: "2rem", width: "40vw", padding: "3vw 3vw 3vw 3vw", marginTop: "3vh", backgroundColor: "#ccccff" }}>
                <div className="mb-3">
                    <label htmlFor="exampleInputEmail1" className="form-label">Email address</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" />
                </div>
                <div className="mb-3">
                    <label htmlFor="exampleInputPassword1" className="form-label">Password</label>
                    <input type="password" name="password" value={formData.password} onChange={handleChange} className="form-control" id="exampleInputPassword1" />
                </div>
                <div className="d-flex justify-content-between">
                    <button type="submit" className="btn btn-primary">Submit</button>
                    <Link href="/register">New User?</Link>
                </div>
            </form>
        </div>
    )
}