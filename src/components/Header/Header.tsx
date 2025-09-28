import React from "react"; // React kütüphanesini import et
import "./Header.css"; // Header CSS dosyasını import et

const Header: React.FC = () => {
  return (
    <header className="header-container">
      {/* Ana header container */}
      {/* Sol taraf - Başlık */}
      <div className="header-left">
        <h1 className="page-title">Staking Offerings</h1> {/* Sayfa başlığı */}
        <button className="learn-more-btn">
          {/* Daha fazla öğren butonu */}
          Learn More
          <div className="flex items-center justify-center w-5 h-5 text-xs bg-gray-700 rounded-full">?</div> {/* Soru işareti ikonu */}
        </button>
      </div>
      {/* Sağ taraf - Arama ve kullanıcı kontrolleri */}
      <div className="header-right">
        <div className="grid" />
        <div id="poda">
          <div className="glow" />
          <div className="darkBorderBg" />
          <div className="darkBorderBg" />
          <div className="darkBorderBg" />
          <div className="white" />
          <div className="border" />
          <div id="main">
            <input
              placeholder="Search..."
              type="text"
              name="text"
              className="input"
            />
            <div id="input-mask" />
            <div id="pink-mask" />
            <div className="filterBorder" />
            <div id="filter-icon">
              <svg
                preserveAspectRatio="none"
                height={27}
                width={27}
                viewBox="4.8 4.56 14.832 15.408"
                fill="none"
              >
                <path
                  d="M8.16 6.65002H15.83C16.47 6.65002 16.99 7.17002 16.99 7.81002V9.09002C16.99 9.56002 16.7 10.14 16.41 10.43L13.91 12.64C13.56 12.93 13.33 13.51 13.33 13.98V16.48C13.33 16.83 13.1 17.29 12.81 17.47L12 17.98C11.24 18.45 10.2 17.92 10.2 16.99V13.91C10.2 13.5 9.97 12.98 9.73 12.69L7.52 10.36C7.23 10.08 7 9.55002 7 9.20002V7.87002C7 7.17002 7.52 6.65002 8.16 6.65002Z"
                  stroke="#d6d6e6"
                  strokeWidth={1}
                  strokeMiterlimit={10}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div id="search-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={24}
                viewBox="0 0 24 24"
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
                height={24}
                fill="none"
                className="feather feather-search"
              >
                <circle stroke="url(#search)" r={8} cy={11} cx={11} />
                <line
                  stroke="url(#searchl)"
                  y2="16.65"
                  y1={22}
                  x2="16.65"
                  x1={22}
                />
                <defs>
                  <linearGradient gradientTransform="rotate(50)" id="search">
                    <stop stopColor="#f8e7f8" offset="0%" />
                    <stop stopColor="#b6a9b7" offset="50%" />
                  </linearGradient>
                  <linearGradient id="searchl">
                    <stop stopColor="#b6a9b7" offset="0%" />
                    <stop stopColor="#837484" offset="50%" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>
        {/* Bildirim ikonu */}
        <button className="button">
          <svg viewBox="0 0 448 512" className="bell">
            <path d="M224 0c-17.7 0-32 14.3-32 32V49.9C119.5 61.4 64 124.2 64 200v33.4c0 45.4-15.5 89.5-43.8 124.9L5.3 377c-5.8 7.2-6.9 17.1-2.9 25.4S14.8 416 24 416H424c9.2 0 17.6-5.3 21.6-13.6s2.9-18.2-2.9-25.4l-14.9-18.6C399.5 322.9 384 278.8 384 233.4V200c0-75.8-55.5-138.6-128-150.1V32c0-17.7-14.3-32-32-32zm0 96h8c57.4 0 104 46.6 104 104v33.4c0 47.9 13.9 94.6 39.7 134.6H72.3C98.1 328 112 281.3 112 233.4V200c0-57.4 46.6-104 104-104h8zm64 352H224 160c0 17 6.7 33.3 18.7 45.3s28.3 18.7 45.3 18.7s33.3-6.7 45.3-18.7s18.7-28.3 18.7-45.3z" />
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Header;
