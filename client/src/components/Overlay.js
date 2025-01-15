import React, { useEffect, useState } from 'react'

const Overlay = ({taskItem, updateFunction, closeFunction}) => {
  const [title, setTitle] = useState(taskItem.title || "");

  useEffect(() => {
    setTitle(taskItem.title || "");
  }, [taskItem]);

  const handleDoneEdit = () => {
    updateFunction(taskItem._id, {title});
    closeFunction();
  }
  return (
    <div className='overlay-content'>
      <input
        type="text"
        value={title}
        onChange={(e) =>
          setTitle(e.target.value)
        }
      />
      <button className='button' onClick={() => handleDoneEdit()}>Confirm</button>
    </div>
  )
}

export default Overlay