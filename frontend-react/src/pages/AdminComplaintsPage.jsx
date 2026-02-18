import { useEffect, useSyncExternalStore } from "react";
import { store } from "../store/complaints.store";
import { complaintService } from "../services/complaint/complaint.service.remote";

export function AdminComplaints() {
  const { complaints } = useSyncExternalStore(store.subscribe, store.getState);
  const currentState = store.getState();

  useEffect(() => {
    complaintService.query().then((complaints) => {
      store.setState({ ...currentState, complaints });
    });
  }, []);

  return (
    <div className="complaints-list">
      <h1>Complaint list</h1>
      {!complaints.length && <div className="loader">loading</div>}
      {complaints.length > 0 && (
        <table>
          <tbody>
            <tr>
              <th>category</th>
              <th>complaint</th>
              <th>Created At</th>
            </tr>
            {complaints.map((complaint) => {
              return (
                <tr key={complaint._id}>
                  <td>{complaint.category}</td>
                  <td>{complaint.txt}</td>
                  <td>{new Date(complaint.createdAt).toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
