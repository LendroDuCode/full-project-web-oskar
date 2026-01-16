import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faPlus,
  faArrowsRotate,
  faTrophy,
  faHeart,
} from "@fortawesome/free-solid-svg-icons";

interface ActivityItem {
  id: number;
  icon: any;
  iconBgColor: string;
  borderColor: string;
  bgColor: string;
  title: string;
  time: string;
  description: string;
}

export default function ActivityTimelineSection() {
  const activities: ActivityItem[] = [
    {
      id: 1,
      icon: faCheck,
      iconBgColor: "bg-success",
      borderColor: "border-success-subtle",
      bgColor: "bg-success-subtle",
      title: "Sold Samsung Galaxy S21 Ultra",
      time: "3 days ago",
      description:
        "Successfully completed transaction with Aïcha Diallo for 350,000 FCFA",
    },
    {
      id: 2,
      icon: faPlus,
      iconBgColor: "bg-warning",
      borderColor: "border-warning-subtle",
      bgColor: "bg-warning-subtle",
      title: "Posted New Ad",
      time: "5 days ago",
      description: 'Listed "Vintage Bicycle" in Sports & Outdoors category',
    },
    {
      id: 3,
      icon: faArrowsRotate,
      iconBgColor: "bg-primary",
      borderColor: "border-primary-subtle",
      bgColor: "bg-primary-subtle",
      title: "Completed Exchange",
      time: "1 week ago",
      description: "Exchanged Mountain Bike with Ibrahim for Gaming Console",
    },
    {
      id: 4,
      icon: faTrophy,
      iconBgColor: "bg-purple-600",
      borderColor: "border-purple-200",
      bgColor: "bg-purple-50",
      title: "Achievement Unlocked",
      time: "1 week ago",
      description:
        'Earned "Top Seller" badge for completing 50+ successful transactions',
    },
    {
      id: 5,
      icon: faHeart,
      iconBgColor: "bg-success",
      borderColor: "border-success-subtle",
      bgColor: "bg-success-subtle",
      title: "Donated University Textbooks",
      time: "2 weeks ago",
      description: "Helped a student by donating educational materials",
    },
  ];

  return (
    <section className="bg-light py-5">
      <div className="container">
        <div className="bg-white rounded-3xl shadow-lg p-4">
          <h2 className="display-6 fw-bold text-dark mb-4">
            Activity Timeline
          </h2>

          <div className="position-relative">
            {/* Timeline vertical line */}
            <div
              className="position-absolute start-0 top-0 h-100"
              style={{
                left: "32px",
                width: "2px",
                backgroundColor: "#e9ecef",
              }}
            ></div>

            <div className="d-flex flex-column gap-4">
              {activities.map((activity, index) => (
                <div
                  key={activity.id}
                  className="position-relative d-flex align-items-start gap-4"
                >
                  {/* Timeline icon */}
                  <div
                    className={`${activity.iconBgColor} rounded-circle d-flex align-items-center justify-content-center position-relative z-2 border-4 border-white`}
                    style={{
                      width: "64px",
                      height: "64px",
                      flexShrink: 0,
                    }}
                  >
                    <FontAwesomeIcon
                      icon={activity.icon}
                      className="text-white fs-5"
                    />
                  </div>

                  {/* Activity card */}
                  <div
                    className={`flex-grow-1 rounded-3 p-4 border-2 ${activity.borderColor} ${activity.bgColor}`}
                    style={{ borderStyle: "solid" }}
                  >
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <h3 className="fw-bold text-dark mb-0">
                        {activity.title}
                      </h3>
                      <span className="text-muted small">{activity.time}</span>
                    </div>
                    <p className="text-muted small mb-0">
                      {activity.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="d-flex justify-content-center mt-4">
            <button className="px-4 py-2 bg-light text-dark rounded fw-semibold border-0 hover-bg-gray-200 transition-colors">
              View Full Timeline
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
