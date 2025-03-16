import "./cardsl.css";
import alandimage from "../../assets/landingimg/aland.webp"
import clandimage from "../../assets/landingimg/cland.jpg"
import rlandimage from "../../assets/landingimg/rland.webp"
const lands = [
  {
    id: 1,
    name: "Agricultural Land",
    location: "Vizag, Ind",
    image:alandimage,
  },
  {
    id: 2,
    name: "Commercial Land",
    location: "Delhi, Ind",
    image: clandimage,
  },
  {
    id: 3,
    name: "Residential Land",
    location: "kerala, Ind",
    image: rlandimage,
  },
];

const LandCards = () => {
  return (
    <section id="cardsl" className="land-section">
      <h2 className="land-title">Find Your Ideal Land</h2>
      <div className="land-container">
        {lands.map((land) => (
          <div key={land.id} className="land-card">
            <img src={land.image} alt={land.name} className="land-image" />
            <div className="land-info">
              <h3>{land.name}</h3>
              <p>{land.location}</p>
              <a href="#nav"  className="view-btn">View</a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default LandCards;
