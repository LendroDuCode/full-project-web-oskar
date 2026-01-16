import React from "react";

const LoadingSkeleton: React.FC = () => {
  return (
    <div className="table-responsive">
      <table className="table table-hover mb-0">
        <thead className="table-light">
          <tr>
            <th style={{ width: "50px" }} className="text-center">
              <div
                className="placeholder placeholder-wave"
                style={{ width: "30px" }}
              />
            </th>
            <th style={{ width: "60px" }} className="text-center">
              <div
                className="placeholder placeholder-wave"
                style={{ width: "40px" }}
              />
            </th>
            <th style={{ width: "150px" }}>
              <div
                className="placeholder placeholder-wave"
                style={{ width: "120px" }}
              />
            </th>
            <th style={{ width: "120px" }}>
              <div
                className="placeholder placeholder-wave"
                style={{ width: "80px" }}
              />
            </th>
            <th style={{ width: "100px" }}>
              <div
                className="placeholder placeholder-wave"
                style={{ width: "70px" }}
              />
            </th>
            <th style={{ width: "160px" }}>
              <div
                className="placeholder placeholder-wave"
                style={{ width: "130px" }}
              />
            </th>
            <th style={{ width: "120px" }}>
              <div
                className="placeholder placeholder-wave"
                style={{ width: "80px" }}
              />
            </th>
            <th style={{ width: "150px" }}>
              <div
                className="placeholder placeholder-wave"
                style={{ width: "100px" }}
              />
            </th>
            <th style={{ width: "140px" }} className="text-center">
              <div
                className="placeholder placeholder-wave"
                style={{ width: "110px" }}
              />
            </th>
          </tr>
        </thead>
        <tbody>
          {[...Array(5)].map((_, i) => (
            <tr key={i}>
              <td className="text-center">
                <div
                  className="placeholder placeholder-wave"
                  style={{ width: "20px", height: "20px" }}
                />
              </td>
              <td className="text-center">
                <div
                  className="placeholder placeholder-wave"
                  style={{ width: "30px" }}
                />
              </td>
              <td>
                <div className="d-flex align-items-center">
                  <div
                    className="placeholder placeholder-wave rounded-circle"
                    style={{ width: "40px", height: "40px" }}
                  />
                  <div className="ms-3 flex-grow-1">
                    <div
                      className="placeholder placeholder-wave"
                      style={{ width: "80%", height: "20px" }}
                    />
                    <div
                      className="placeholder placeholder-wave mt-1"
                      style={{ width: "60%", height: "15px" }}
                    />
                  </div>
                </div>
              </td>
              <td>
                <div
                  className="placeholder placeholder-wave"
                  style={{ width: "80px", height: "25px" }}
                />
              </td>
              <td>
                <div
                  className="placeholder placeholder-wave rounded"
                  style={{ width: "50px", height: "50px" }}
                />
              </td>
              <td>
                <div className="d-flex flex-wrap gap-1">
                  <div
                    className="placeholder placeholder-wave"
                    style={{ width: "70px", height: "25px" }}
                  />
                  <div
                    className="placeholder placeholder-wave"
                    style={{ width: "60px", height: "25px" }}
                  />
                </div>
              </td>
              <td>
                <div
                  className="placeholder placeholder-wave"
                  style={{ width: "70px", height: "25px" }}
                />
              </td>
              <td>
                <div className="d-flex align-items-center">
                  <div
                    className="placeholder placeholder-wave me-2"
                    style={{ width: "15px", height: "15px" }}
                  />
                  <div
                    className="placeholder placeholder-wave"
                    style={{ width: "80px", height: "15px" }}
                  />
                </div>
              </td>
              <td className="text-center">
                <div className="btn-group btn-group-sm placeholder-wave">
                  <div
                    className="btn btn-outline-primary placeholder"
                    style={{ width: "35px", height: "30px" }}
                  />
                  <div
                    className="btn btn-outline-warning placeholder"
                    style={{ width: "35px", height: "30px" }}
                  />
                  <div
                    className="btn btn-outline-danger placeholder"
                    style={{ width: "35px", height: "30px" }}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LoadingSkeleton;
