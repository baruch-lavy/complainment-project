import { useNavigate } from "react-router";

export function HomePage() {
  const handleSubmitComplaintButtonClick = () => navigate("/submitComplaint");
  const handleAdminButtonClick = () => navigate('/AdminLogin')

  const navigate = useNavigate();


  return (
    <div className="home-page">
      <h1>home page</h1>
      <header>
        <button onClick={handleAdminButtonClick}>admin login</button>
      </header>
      <button onClick={handleSubmitComplaintButtonClick}>
        Submit Complaint
      </button>

    </div>
  );
}
