'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function CinemasPage() {

  const [cinemas, setCinemas] = useState([])
  const [form, setForm] = useState({
    name:'',
    city:'',
    location:'',
    screens_count:'',
    seats_count:''
  })

  useEffect(() => {
    fetchCinemas()
  }, [])

  const fetchCinemas = async () => {
    const { data } = await supabase
      .from('cinemas')
      .select('*')
console.log("CINEMAS =", cinemas);
    setCinemas(data || [])
  }

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  const addCinema = async () => {

    await supabase.from('cinemas').insert([{
      name: form.name,
      city: form.city,
      location: form.location,
      screens_count: Number(form.screens_count),
      seats_count: Number(form.seats_count)
    }])

    setForm({
      name:'',
      city:'',
      location:'',
      screens_count:'',
      seats_count:''
    })

    fetchCinemas()
  }

  return (
    <div style={{ background:'#0b0b0b', color:'white', minHeight:'100vh', padding:'40px' }}>

      <h1>🏢 Cinemas</h1>

      <div style={{ marginBottom:'20px' }}>
        <input name="name" placeholder="Cinema Name" onChange={handleChange} value={form.name} />
        <input name="city" placeholder="City" onChange={handleChange} value={form.city} />
        <input name="location" placeholder="Location" onChange={handleChange} value={form.location} />
        <input name="screens_count" placeholder="Screens" onChange={handleChange} value={form.screens_count} />
        <input name="seats_count" placeholder="Seats" onChange={handleChange} value={form.seats_count} />

        <button onClick={addCinema} style={{ marginTop:'10px', padding:'10px', background:'red', color:'white' }}>
          Add Cinema
        </button>
      </div>

      {cinemas.map(c => (
        <div key={c.id} style={{ background:'#1a1a1a', padding:'15px', marginTop:'10px', borderRadius:'10px' }}>
          <h3>{c.name}</h3>
          <p>City: {c.city}</p>
          <p>Location: {c.location}</p>
          <p>Screens: {c.screens_count}</p>
          <p>Seats: {c.seats_count}</p>
        </div>
      ))}

    </div>
  )
}