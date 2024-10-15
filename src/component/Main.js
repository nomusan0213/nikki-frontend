import React, { useState } from 'react';
import ReactModal from 'react-modal';
import ModalComponent from './ModalComponent';

ReactModal.setAppElement('#root'); // For accessibility

export const Main = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectDay, setSelectDay] = useState();
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [message, setMessage] = useState([]);  // memoの値を格納
  const [hoveredMemo, setHoveredMemo] = useState('');  // ホバー時に表示するメモ
  const [hoveredDay, setHoveredDay] = useState(null);  // ホバーしている日付

  const years = Array.from({ length: 10 }, (_, i) => selectedYear - 5 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const firstDayOfMonth = new Date(selectedYear, selectedMonth - 1, 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const transitionToModal = async (day) => {
    setSelectDay(day);
    setMessage([]); // 初期化
    try {
      const response = await fetch(`http://127.0.0.1:8000/getMemo?year=${selectedYear}&month=${selectedMonth}&day=${day}`);
      if (response.ok) {
        const data = await response.json();
        setMessage(data.memo);  // APIから取得したメモを格納
      } else {
        setMessage([]); // 取得に失敗した場合は空に
      }
    } catch (error) {
      console.error('Error fetching memo:', error);
      setMessage([]); // エラー時も空に
    }
    setModalIsOpen(true);
  };

  const handleMouseEnter = async (day) => {
    setHoveredDay(day);  // ホバーしている日付を設定
    setHoveredMemo('');   // 初期化
    try {
      const response = await fetch(`http://127.0.0.1:8000/getMemo?year=${selectedYear}&month=${selectedMonth}&day=${day}`);
      if (response.ok) {
        const data = await response.json();
        setHoveredMemo(data.memo || 'No memo');  // APIから取得したメモをホバー用にセット
      } else {
        setHoveredMemo('No memo');
      }
    } catch (error) {
      setHoveredMemo('Error fetching memo');
    }
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  return (
    <div className="max-w-4xl p-4 mx-auto relative">
      <div className="flex justify-between mb-4">
        <div className="relative">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="block w-full px-4 py-2 pr-8 leading-tight bg-white border border-gray-400 rounded shadow appearance-none hover:border-gray-500 focus:outline-none focus:shadow-outline"
          >
            {years.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        <div className="relative">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="block w-full px-4 py-2 pr-8 leading-tight bg-white border border-gray-400 rounded shadow appearance-none hover:border-gray-500 focus:outline-none focus:shadow-outline"
          >
            {months.map((month) => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="font-bold text-center">{day}</div>
        ))}
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={i}></div>
        ))}
        {days.map((day) => (
          <div
            key={day}
            onClick={() => transitionToModal(day)}
            onMouseEnter={() => handleMouseEnter(day)}  // ホバー時にメモを取得
            onMouseLeave={() => setHoveredMemo('')}  // ホバーが外れた時にメモを消す
            className="p-4 border rounded cursor-pointer hover:bg-gray-200 relative"
          >
            {day}
            {/* ホバーした際のツールチップ */}
            {hoveredDay === day && hoveredMemo && hoveredMemo !== 'No memo' && hoveredMemo !== 'Error fetching memo' && (
              <div className="absolute bottom-14 left-1/2 transform -translate-x-1/2 p-4 bg-white text-black rounded-lg shadow-lg w-60">
                <p className="text-sm">{hoveredMemo}</p>
              </div>
            )}
          </div>
        ))}
      </div>
      <ModalComponent
        day={selectDay}
        year={selectedYear}
        month={selectedMonth}
        memo={message}  // APIから取得したメモを渡す
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
      />
    </div>
  );
};
