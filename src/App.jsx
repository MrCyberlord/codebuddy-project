import { useState, useEffect } from "react";

const SeatBooking = () => {
  const [numRows, setNumRows] = useState(3);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [totalCost, setTotalCost] = useState(0);

  useEffect(() => {
    const fetchSeats = async () => {
      try {
        const response = await fetch(`https://codebuddy.review/seats?count=${numRows}`);
        const data = await response.json();
        console.log(JSON.stringify(data, null, 2));
        setSeats(data.data);
      } catch (error) {
        console.error("Error fetching seats:", error);
      }
    };

    fetchSeats();
  }, [numRows]);

  useEffect(() => {
    const findSeatById = (seatId) => {
      for (const row of seats) {
        for (const seat of row.seats) {
          if (seat.id === seatId) {
            return seat;
          }
        }
      }
      return null;
    };

    const calculateTotalCost = () => {
      let cost = 0;

      selectedSeats.forEach((seatId) => {
        const seat = findSeatById(seatId);
        if (seat) {
          cost += 20 + (seat.row + 1) * 10;
        }
      });

      setTotalCost(cost);
    };

    calculateTotalCost();
  }, [selectedSeats, seats]);

  const handleRowChange = (e) => {
    let value = parseInt(e.target.value);
    if (isNaN(value)) {
      value = 3;
    }
    if (value < 3) value = 3;
    if (value > 10) value = 10;
    setNumRows(value);
  };

  const handleSeatClick = (seatId) => {
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter((id) => id !== seatId));
    } else if (selectedSeats.length < 5) {
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  const handleSubmit = async () => {
    if (selectedSeats.length < 1 || selectedSeats.length > 5) {
      alert("Please select between 1 and 5 seats.");
      return;
    }
    try {
      const response = await fetch("https://codebuddy.review/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ seatIds: selectedSeats }),
      });
      if (response.ok) {
        alert("Seats booked successfully!");
        console.log("Selected seats:", selectedSeats);
      } else {
        console.error("Error submitting seats:", response.statusText);
      }
    } catch (error) {
      console.error("Error submitting seats:", error);
    }
  };

  const renderSeats = () => {
    const rows = Array.from({ length: numRows }, () => []);

    seats.forEach((row) => {
      row.seats.forEach((seat) => {
        if (seat.row < numRows) {
          rows[seat.row].push(seat);
        }
      });
    });

    return rows.map((row, rowIndex) => (
      <div key={rowIndex} className="mb-2 flex justify-center">
        {row.map((seat) => {
          const reserved = seat.isReserved;
          const selected = selectedSeats.includes(seat.id);
          return (
            <button
              key={seat.id}
              className={`m-1 flex h-16 w-24 flex-col items-center justify-center rounded-lg border p-2
              ${
                reserved
                  ? "bg-red-700 text-white"
                  : selected
                    ? "bg-green-700 text-white"
                    : "bg-gray-700 text-white"
              } 
              ${reserved ? "cursor-not-allowed" : "cursor-pointer"} 
              ${reserved ? "" : "hover:bg-blue-700"}`}
              disabled={reserved}
              onClick={() => !reserved && handleSeatClick(seat.id)}
            >
              <div className="text-lg font-bold">Seat {seat.seatNumber}</div>
              <div className="text-xs">{reserved ? "Reserved" : "Available"}</div>
              <div className="text-xs">Row {seat.row + 1}</div>
            </button>
          );
        })}
      </div>
    ));
  };

  return (
    <div className="relative min-h-screen bg-gray-900 p-4 text-white">
      <div className="fixed left-0 right-0 top-0 z-10 bg-gray-800 p-4 shadow-md">
        <h1 className="mb-4 text-center text-3xl font-bold">Movie Theater Seat Booking</h1>
        <div className="mx-auto flex w-full max-w-4xl flex-col items-center justify-between md:flex-row">
          <div className="mb-4 md:mb-0">
            <label htmlFor="numRows" className="mr-2 font-bold">
              Number of Rows:
            </label>
            <input
              type="number"
              id="numRows"
              value={numRows}
              onChange={handleRowChange}
              min="3"
              max="10"
              className="w-15 h-5 rounded border bg-gray-800 p-1 text-white"
            />
          </div>
          <div className="flex flex-col items-center">
            <h2 className="mb-2 text-xl font-semibold">Total Cost: ${totalCost}</h2>
            <button
              onClick={handleSubmit}
              className="rounded bg-green-700 p-2 text-white shadow-md hover:bg-green-800"
            >
              Submit Selection
            </button>
          </div>
        </div>
      </div>
      <div className="mt-56 flex w-full justify-center overflow-auto md:mt-40">
        <div className="flex flex-col items-center">{renderSeats()}</div>
      </div>
    </div>
  );
};

export default SeatBooking;
