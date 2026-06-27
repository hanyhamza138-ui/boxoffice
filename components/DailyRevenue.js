export default function DailyRevenue({
  daily = []
}) {


  const totalRevenue =
    daily.reduce(
      (sum,item)=>
        sum + Number(item.revenue || 0),
      0
    );


  const totalAudience =
    daily.reduce(
      (sum,item)=>
        sum + Number(item.audience || 0),
      0
    );



  return (

    <div
      style={{
        background:"#1c1c1c",
        padding:20,
        borderRadius:12,
        marginTop:30,
      }}
    >


      <h2>
        📅 Daily Revenue Report
      </h2>



      {
        daily.length === 0

        ?

        <div
          style={{
            color:"#888",
            textAlign:"center",
            padding:30,
          }}
        >
          No data
        </div>


        :


        <div
          style={{
            marginTop:20,
            overflowX:"auto",
          }}
        >


          <table
            style={{
              width:"100%",
              borderCollapse:"collapse",
            }}
          >

            <thead>

              <tr
                style={{
                  borderBottom:"1px solid #333",
                  textAlign:"left",
                }}
              >

                <th
                  style={{padding:12}}
                >
                  Date
                </th>


                <th
                  style={{padding:12}}
                >
                  Revenue
                </th>


                <th
                  style={{padding:12}}
                >
                  Audience
                </th>


              </tr>

            </thead>



            <tbody>


              {
                daily.map(
                  (item,index)=>(

                    <tr
                      key={index}
                      style={{
                        borderBottom:
                        "1px solid #333",
                      }}
                    >

                      <td
                        style={{
                          padding:12,
                        }}
                      >
                        {item.date}
                      </td>


                      <td
                        style={{
                          padding:12,
                        }}
                      >

                        {
                          Number(
                            item.revenue || 0
                          )
                          .toLocaleString()
                        }

                      </td>


                      <td
                        style={{
                          padding:12,
                        }}
                      >

                        {
                          Number(
                            item.audience || 0
                          )
                          .toLocaleString()
                        }

                      </td>


                    </tr>

                  )
                )
              }


            </tbody>


          </table>


        </div>

      }



      {
        daily.length > 0 &&

        <div
          style={{
            marginTop:25,
            paddingTop:20,
            borderTop:"1px solid #333",
            display:"flex",
            justifyContent:"space-around",
            fontWeight:800,
          }}
        >

          <div>
            💰 Total:
            {" "}
            {
              totalRevenue
              .toLocaleString()
            }
          </div>


          <div>
            👥 Audience:
            {" "}
            {
              totalAudience
              .toLocaleString()
            }
          </div>


        </div>

      }


    </div>

  );

}