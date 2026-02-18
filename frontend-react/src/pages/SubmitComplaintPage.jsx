import { useState, useSyncExternalStore } from "react";
import { store } from "../store/complaints.store";
import { useNavigate } from "react-router";

export function SubmitComplaint() {
  const { complaint } = useSyncExternalStore(store.subscribe, store.getState);
  const currentState = store.getState();
  const navigate = useNavigate();

  const [userMsg, setUserMsg] = useState(null);

  function handleChange(ev) {
    const { name, value } = ev.target;
    store.setState({
      ...currentState,
      complaint: { ...complaint, [name]: value },
    });
  }

  function handleSubmit(ev) {
    ev.preventDefault();

    if (complaint.category && complaint.txt) {
      store.addComplaint(complaint);

      setUserMsg("complaint sended successfuly");
      setTimeout(() => {
        setUserMsg(null);
        navigate("/");
      }, 2000);
      store.setState({
        ...currentState,
        complaint: { ...complaint, category: null, txt: null },
      });
    }
  }

  return (
    <div className="complaint-container">
      <form onSubmit={handleSubmit} className="submit-form">
        <label htmlFor="select">Select Complaint Category</label>
        <select
          name="category"
          id="select"
          value={complaint.category || ""}
          onChange={handleChange}
        >
          <option disabled value="">
            --select category--
          </option>
          <option value="food">Food</option>
          <option value="equipment">Equipment</option>
          <option value="orders">Orders</option>
        </select>

        <label htmlFor="complaint-txt-area">enter your complaint</label>
        <textarea
          name="txt"
          value={complaint.txt || ""}
          id="complaint-txt-area"
          placeholder="enter your complaint"
          onChange={handleChange}
        ></textarea>

        <button className="submit-btn" type="submit">
          Submit
        </button>
      </form>
      {userMsg && (
        <div className="usr-msg">
          <p>{userMsg}</p>
        </div>
      )}
    </div>
  );
}
