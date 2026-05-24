'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function StatsPage() {

  const [data, setData] = useState({
    movie_id:'',
    cinema:'',
    revenue:'',
    audience:'',
    date:''
  })

  const handleChange = (e) => {
    setData({
      ...data,
      [e.target.name]: e.target.value
    })
  }

  const saveStats = async () => {

    const { error } = await supabase
      .from('daily_stats')
      .insert([{
        movie_id: Number(data.movie_id),
        cinema: data.cinema,
        revenue: Number(data.revenue),
        audience: Number(data.audience),
        date: data.date
      }])

    if (error) {
      alert(error.message)
    } else {
      alert('Stats Saved ✅')

      setData({
        movie_id:'',
        cinema:'',
        revenue:'',
        audience:'',
        date:''
      })
    }
  }

  return (
    <div style={{
      background:'#0b0b0b',
      color:'white',
      minHeight:'100vh',
      padding:'40px'
    }}>

      <h1>📊 Daily Box Office Stats</h1>

      <input name="movie_id" placeholder="Movie ID" onChange={handleChange} value={data.movie_id} />
      <input name="cinema" placeholder="Cinema Name" onChange={handleChange} value={data.cinema} />
      <input name="revenue" placeholder="Revenue" onChange={handleChange} value={data.revenue} />
      <input name="audience" placeholder="Audience" onChange={handleChange} value={data.audience} />
      <input type="date" name="date" onChange={handleChange} value={data.date} />

      <button onClick={saveStats} style={{
        padding:'12px',
        background:'red',
        color:'white',
        marginTop:'10px'
      }}>
        Save Stats
      </button>

    </div>
  )
}