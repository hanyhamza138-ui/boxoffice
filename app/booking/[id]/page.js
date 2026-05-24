'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function BookingPage({ params }) {

  const [movieId, setMovieId] = useState(null)

  const [name, setName] = useState('')

  const [selectedSeats, setSelectedSeats] = useState([])

  const [takenSeats, setTakenSeats] = useState([])

  // 🟢 حل params في Next.js 16
  useEffect(() => {

    const loadParams = async () => {

      const resolvedParams = await params

      setMovieId(
        Number(resolvedParams.id)
      )

    }

    loadParams()

  }, [params])

  // 🟢 تحميل المقاعد المحجوزة
  useEffect(() => {

    if (!movieId) return

    const loadBookings = async () => {

      const { data } = await supabase
        .from('bookings')
        .select('seats_map')
        .eq('movie_id', movieId)

      let booked = []

      data?.forEach(item => {

        try {

          const parsed = JSON.parse(
            item.seats_map || '[]'
          )

          booked = [...booked, ...parsed]

        } catch {}

      })

      setTakenSeats(booked)

    }

    loadBookings()

  }, [movieId])

  // 🟢 جميع المقاعد
  const seats = Array.from(
    { length: 30 },
    (_, i) => i + 1
  )

  // 🟢 اختيار المقاعد
  const toggleSeat = (seat) => {

    if (takenSeats.includes(seat)) return

    if (selectedSeats.includes(seat)) {

      setSelectedSeats(
        selectedSeats.filter(s => s !== seat)
      )

    } else {

      setSelectedSeats([
        ...selectedSeats,
        seat
      ])

    }

  }

  // 🟢 الحجز
  const book = async () => {

    if (!name) {
      alert('Enter your name')
      return
    }

    if (selectedSeats.length === 0) {
      alert('Select seats')
      return
    }

    // 🟢 منع المقاعد المكررة
    const { data: existing } = await supabase
      .from('bookings')
      .select('seats_map')
      .eq('movie_id', movieId)

    let booked = []

    existing?.forEach(item => {

      try {

        const parsed = JSON.parse(
          item.seats_map || '[]'
        )

        booked = [...booked, ...parsed]

      } catch {}

    })

    const conflict = selectedSeats.some(
      seat => booked.includes(seat)
    )

    if (conflict) {
      alert('Seat already booked ❌')
      return
    }

    // 🟢 حفظ الحجز
    const { error } = await supabase
      .from('bookings')
      .insert([{
        movie_id: movieId,
        user_name: name,
        seats: selectedSeats.length,
        seats_map: JSON.stringify(selectedSeats),
        date: new Date()
          .toISOString()
          .split('T')[0]
      }])

    if (error) {
      alert(error.message)
      return
    }

    // 🟢 تسجيل الإيراد
    await supabase
      .from('daily_stats')
      .insert([{
        movie_id: movieId,
        revenue: selectedSeats.length * 100,
        audience: selectedSeats.length,
        date: new Date()
          .toISOString()
          .split('T')[0]
      }])

    alert('Booking Successful 🎉')

    setTakenSeats([
      ...takenSeats,
      ...selectedSeats
    ])

    setSelectedSeats([])

    setName('')

  }

  // 🟢 Loading
  if (!movieId) {

    return (
      <div
        style={{
          background: '#111',
          minHeight: '100vh',
          color: 'white',
          padding: 30
        }}
      >
        <h1>Loading...</h1>
      </div>
    )

  }

  return (

    <div
      style={{
        background: '#111',
        minHeight: '100vh',
        color: 'white',
        padding: 30
      }}
    >

      <h1
        style={{
          marginBottom: 20,
          fontSize: 38
        }}
      >
        🎟 Book Tickets
      </h1>

      <input
        placeholder="Your Name"
        value={name}
        onChange={(e) =>
          setName(e.target.value)
        }
        style={{
          padding: 12,
          width: 300,
          borderRadius: 8,
          border: 'none',
          marginBottom: 30
        }}
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(6,70px)',
          gap: 12
        }}
      >

        {seats.map(seat => {

          const taken =
            takenSeats.includes(seat)

          const selected =
            selectedSeats.includes(seat)

          return (

            <button
              key={seat}
              onClick={() =>
                toggleSeat(seat)
              }
              disabled={taken}
              style={{
                height: 60,
                borderRadius: 10,
                border: 'none',
                cursor: taken
                  ? 'not-allowed'
                  : 'pointer',
                background:
                  taken
                    ? '#444'
                    : selected
                    ? 'limegreen'
                    : '#222',
                color: 'white',
                fontSize: 18
              }}
            >
              {seat}
            </button>

          )

        })}

      </div>

      <h2
        style={{
          marginTop: 30
        }}
      >
        💰 Total:
        {' '}
        {selectedSeats.length * 100}
        {' '}
        EGP
      </h2>

      <button
        onClick={book}
        style={{
          marginTop: 20,
          padding: '14px 24px',
          border: 'none',
          borderRadius: 10,
          cursor: 'pointer',
          fontSize: 18
        }}
      >
        Confirm Booking
      </button>

    </div>

  )

}