'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function Cinemas() {

  const [cinemas, setCinemas] = useState([])

  useEffect(() => {
    const fetchCinemas = async () => {
      const { data } = await supabase
        .from('cinemas')
        .select('*')

      setCinemas(data || [])
    }

    fetchCinemas()
  }, [])

  return (
    <div style={{ padding: 30 }}>
      <h1>🏢 Cinemas</h1>

      {cinemas.map(c => (
        <div key={c.id}>
          <h3>{c.name}</h3>
        </div>
      ))}
    </div>
  )
}