import React, { useState, useEffect } from 'react';
import ReactModal from 'react-modal';

const ModalComponent = ({ day, month, year, memo, isOpen, onRequestClose }) => {
  const [inputValue, setInputValue] = useState('');
  const [entries, setEntries] = useState([]);  // 初期値は空の配列
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingValue, setEditingValue] = useState('');

  useEffect(()=>{
    console.log({"entries": entries})
  },[entries])

  // memoが変更された場合、entriesに反映
  useEffect(() => {
    if (Array.isArray(memo)) {
      setEntries(memo);  // memoが配列ならそのままセット
    } else {
      setEntries([]);  // 配列でない場合は空の配列を設定
    }
  }, [memo]);

  // API通信
  const handleSubmit = async (newEntries) => {
    const data = {
      year: year,
      month: month,
      day: day,
      memo: newEntries
    };

    try {
      const response = await fetch('http://127.0.0.1:8000/dialy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        console.log("Data saved successfully!");
      } else {
        console.log("Failed to save data.");
      }
    } catch (error) {
      console.error("Error:", error);
      console.log("An error occurred.");
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  // 文章を追加
  const handleAddEntry = () => {
    if (inputValue.trim() !== '') {
      const newEntries = [...entries, inputValue];
      setEntries(newEntries);
      setInputValue('');
      // DBにデータを格納 (setEntriesの更新後にhandleSubmitにnewEntriesを渡す)
      handleSubmit(newEntries);
    }
  };

  // Enterキーで追加する
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddEntry();
    }
  };

  const startEditing = (index, value) => {
    setEditingIndex(index);
    setEditingValue(value);
  };

  const handleEditingChange = (e) => {
    setEditingValue(e.target.value);
  };

  const saveEditing = () => {
    const newEntries = [...entries];
    // 編集した値に入れ替える
    newEntries[editingIndex] = editingValue;
    setEntries(newEntries);
    setEditingIndex(null);
    setEditingValue('');
  };

  const handleDelete = () => {
    setEntries([]);
  };

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Daily"
      className="max-w-lg p-6 mx-auto mt-20 bg-white rounded shadow-lg"
      overlayClassName="fixed inset-0 bg-gray-600 bg-opacity-50"
    >
      {/* 入力した文章 */}
      <h2 className="mb-4 text-xl font-bold">{"Day " + day}</h2>
      <div className="mt-4">
        <ul className="pl-0 text-xs list-none">
          {entries.map((entry, index) => (
            <li key={index} className="mb-1">
              {editingIndex === index ? (
                <input
                  type="text"
                  value={editingValue}
                  onChange={handleEditingChange}
                  onBlur={saveEditing}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      saveEditing();
                    }
                  }}
                  className="w-full p-1 mb-2 text-xs border border-gray-300 rounded"
                />
              ) : (
                <span onClick={() => startEditing(index, entry)}>{entry}</span>
              )}
            </li>
          ))}
        </ul>
      </div>
      {/* 追加したい文章入力 */}
      <div className="flex items-center mb-2 text-sm">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          className="flex-grow p-1 mr-2 text-sm border border-gray-300 rounded"
          placeholder="some text..."
        />
        <button
          onClick={handleAddEntry}
          className="px-2 py-1 text-sm text-white bg-blue-500 rounded hover:bg-blue-600"
        >
          add
        </button>
      </div>
      {/* 削除 */}
      <div className="flex items-center justify-end">
        <button
          onClick={handleDelete}
          className="px-2 py-1 text-sm text-white bg-blue-500 rounded hover:bg-blue-600"
        >
          delete
        </button>
      </div>
      {/* モーダルを閉じる */}
      <div className='flex items-center justify-center'>
        <button
          onClick={() => {
            handleSubmit(entries);
            onRequestClose();
          }}
          className="px-2 py-1 text-sm text-white bg-blue-500 rounded hover:bg-blue-600"
        >
          close
        </button>
      </div>
    </ReactModal>
  );
};

export default ModalComponent;
