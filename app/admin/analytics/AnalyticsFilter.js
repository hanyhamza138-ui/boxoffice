"use client";

import { useRouter, useSearchParams } from "next/navigation";


export default function AnalyticsFilter() {

  const router = useRouter();

  const searchParams =
    useSearchParams();



  const today =
    new Date()
      .toISOString()
      .split("T")[0];



  const currentFrom =
    searchParams.get("from") || today;


  const currentTo =
    searchParams.get("to") || today;



  function goToReport(from, to) {

    router.push(
      `/admin/analytics?from=${from}&to=${to}`
    );

  }



  function customSubmit(e) {

    e.preventDefault();


    const form =
      new FormData(e.currentTarget);


    goToReport(
      form.get("from"),
      form.get("to")
    );

  }




  function formatDate(date){

    return date
      .toISOString()
      .split("T")[0];

  }




  function todayReport(){

    const now = new Date();

    goToReport(
      formatDate(now),
      formatDate(now)
    );

  }




  function lastDays(days){

    const to =
      new Date();


    const from =
      new Date();


    from.setDate(
      from.getDate() - days
    );


    goToReport(
      formatDate(from),
      formatDate(to)
    );

  }





  function thisMonth(){

    const now =
      new Date();


    const from =
      new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      );


    goToReport(
      formatDate(from),
      formatDate(now)
    );

  }





  function thisYear(){

    const now =
      new Date();


    const from =
      new Date(
        now.getFullYear(),
        0,
        1
      );


    goToReport(
      formatDate(from),
      formatDate(now)
    );

  }





  return (

    <>

      <div
        style={{
          background:"#1c1c1c",
          padding:"15px",
          borderRadius:"10px",
          marginTop:"20px",
          display:"flex",
          gap:"10px",
          flexWrap:"wrap",
        }}
      >

        <button onClick={todayReport}>
          📅 اليوم
        </button>


        <button
          onClick={() => lastDays(7)}
        >
          📅 آخر 7 أيام
        </button>


        <button
          onClick={() => lastDays(30)}
        >
          📅 آخر 30 يوم
        </button>


        <button
          onClick={thisMonth}
        >
          📅 هذا الشهر
        </button>


        <button
          onClick={thisYear}
        >
          📅 هذه السنة
        </button>


      </div>




      <form
        onSubmit={customSubmit}
        style={{
          background:"#1c1c1c",
          padding:"20px",
          borderRadius:"10px",
          marginTop:"20px",
          display:"flex",
          gap:"15px",
          flexWrap:"wrap",
          alignItems:"center",
        }}
      >


        <div>

          <label>
            من
          </label>

          <br/>

          <input
            name="from"
            type="date"
            defaultValue={currentFrom}
          />

        </div>




        <div>

          <label>
            إلى
          </label>

          <br/>

          <input
            name="to"
            type="date"
            defaultValue={currentTo}
          />

        </div>




        <button
          type="submit"
          style={{
            marginTop:"20px",
            padding:"10px 20px",
            cursor:"pointer",
          }}
        >
          عرض التقرير
        </button>



      </form>

    </>

  );

}