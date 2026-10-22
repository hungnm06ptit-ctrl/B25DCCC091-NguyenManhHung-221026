import React, { useState, useEffect } from 'react';
import { 
  Search, Sun, Moon, Cloud, CloudRain, CloudLightning, 
  Wind, Droplets, RefreshCw, Thermometer, Calendar, 
  MapPin, Star, AlertTriangle, X, ChevronRight, Check
} from 'lucide-react';

const CITIES = [
  { name: 'Hà Nội', lat: 21.0285, lon: 105.8542 },
  { name: 'Hải Phòng', lat: 20.8449, lon: 106.6881 },
  { name: 'Huế', lat: 16.4637, lon: 107.5909 },
  { name: 'Đà Nẵng', lat: 16.0544, lon: 108.2022 },
  { name: 'Nha Trang', lat: 12.2388, lon: 109.1967 },
  { name: 'Đà Lạt', lat: 11.9404, lon: 108.4583 },
  { name: 'TP. Hồ Chí Minh', lat: 10.8231, lon: 106.6297 },
  { name: 'Cần Thơ', lat: 10.0452, lon: 105.7469 }
];

export default function App() {
  const [selectedCity, setSelectedCity] = useState(CITIES[0]);
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isCelsius, setIsCelsius] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // State nâng cao: Dark mode, Favorites, Thử nghiệm lỗi API
  const [darkMode, setDarkMode] = useState(true);
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('weather_favorites');
    return saved ? JSON.parse(saved) : ['Hà Nội', 'TP. Hồ Chí Minh'];
  });
  const [simulatingError, setSimulatingError] = useState(false);

  useEffect(() => {
    localStorage.setItem('weather_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const fetchWeather = async (city, forceError = false) => {
    if (!city) return;
    setLoading(true);
    setError(null);
    try {
      if (forceError) {
        throw new Error('Lỗi kết nối API Open-Meteo giả lập thành công!');
      }
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Asia%2FHo_Chi_Minh&forecast_days=7`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Không thể tải dữ liệu thời tiết.');
      const data = await res.json();
      setWeatherData(data);
    } catch (err) {
      setError(err.message || 'Đã xảy ra lỗi khi lấy dữ liệu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(selectedCity, simulatingError);
  }, [selectedCity, simulatingError]);

  const toggleFavorite = (cityName, e) => {
    e.stopPropagation();
    setFavorites(prev => 
      prev.includes(cityName) ? prev.filter(c => c !== cityName) : [...prev, cityName]
    );
  };

  // Hàm chuyển đổi độ C sang F
  const convertTemp = (tempC) => {
    if (tempC === undefined || tempC === null) return '';
    if (isCelsius) return `${Math.round(tempC)}°C`;
    return `${Math.round((tempC * 9/5) + 32)}°F`;
  };

  // Chuẩn hóa tiếng Việt không dấu để tìm kiếm
  const removeDiacritics = (str) => {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  };

  const filteredCities = CITIES.filter(city => 
    removeDiacritics(city.name).includes(removeDiacritics(searchQuery))
  );

  // Giải mã Weather Code theo Open-Meteo
  const getWeatherInfo = (code) => {
    switch (code) {
      case 0: return { text: 'Trời quang đãng', icon: <Sun className="w-8 h-8 text-amber-400 animate-spin-slow" />, bg: 'from-amber-500/20 to-orange-500/20' };
      case 1:
      case 2:
      case 3: return { text: 'Có mây / Nhiều mây', icon: <Cloud className="w-8 h-8 text-sky-400" />, bg: 'from-sky-500/20 to-blue-500/20' };
      case 45:
      case 48: return { text: 'Có sương mù', icon: <Cloud className="w-8 h-8 text-slate-400" />, bg: 'from-slate-500/20 to-zinc-500/20' };
      case 51:
      case 53:
      case 55:
      case 56:
      case 57:
      case 61:
      case 63:
      case 65: return { text: 'Mưa rào / Mưa lớn', icon: <CloudRain className="w-8 h-8 text-blue-500" />, bg: 'from-blue-600/20 to-indigo-600/20' };
      case 95:
      case 96:
      case 99: return { text: 'Có dông sét', icon: <CloudLightning className="w-8 h-8 text-purple-400 animate-bounce" />, bg: 'from-purple-600/20 to-pink-600/20' };
      default: return { text: 'Thời tiết ổn định', icon: <Sun className="w-8 h-8 text-amber-400" />, bg: 'from-blue-500/20 to-cyan-500/20' };
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-800'}`}>
      
      {/* Header */}
      <header className={`sticky top-0 z-50 backdrop-blur-md border-b transition-colors ${darkMode ? 'bg-slate-900/85 border-slate-800' : 'bg-white/85 border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-sky-500 to-indigo-600 rounded-2xl shadow-lg shadow-sky-500/30 text-white">
              <Thermometer className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-sky-400 to-indigo-500 bg-clip-text text-transparent">
                WeatherVN 8 Thành Phố
              </h1>
              <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Hệ thống dự báo thời tiết trực tuyến (Open-Meteo API)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {/* Nút Test Lỗi (YC4) */}
            <button
              onClick={() => setSimulatingError(!simulatingError)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                simulatingError 
                  ? 'bg-rose-500/20 border-rose-500 text-rose-400' 
                  : darkMode ? 'border-slate-700 hover:bg-slate-800 text-slate-300' : 'border-slate-300 hover:bg-slate-100 text-slate-600'
              }`}
            >
              {simulatingError ? 'Đang bật giả lập lỗi' : 'Test lỗi API'}
            </button>

            {/* Nút Đổi độ C / F (YC5) */}
            <div className={`flex p-1 rounded-xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-200 border-slate-300'}`}>
              <button
                onClick={() => setIsCelsius(true)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${isCelsius ? 'bg-sky-500 text-white shadow' : 'text-slate-400 hover:text-white'}`}
              >
                °C
              </button>
              <button
                onClick={() => setIsCelsius(false)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${!isCelsius ? 'bg-sky-500 text-white shadow' : 'text-slate-400 hover:text-white'}`}
              >
                °F
              </button>
            </div>

            {/* Nút Chế độ Sáng / Tối mới thêm */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2.5 rounded-xl border transition-all ${darkMode ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700' : 'bg-white border-slate-300 text-indigo-600 hover:bg-slate-100 shadow-sm'}`}
              title="Đổi giao diện sáng/tối"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Cột trái: Danh sách thành phố (YC1 & Nâng cao) */}
        <section className="md:col-span-4 flex flex-col gap-4">
          <div className="relative">
            <Search className={`absolute left-3.5 top-3.5 w-4 h-4 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`} />
            <input
              type="text"
              placeholder="Tìm thành phố (không dấu)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 rounded-2xl border text-sm outline-none transition-all ${
                darkMode 
                  ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500 focus:border-sky-500' 
                  : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400 focus:border-sky-500 shadow-sm'
              }`}
            />
          </div>

          <div className="flex flex-col gap-2.5">
            <h2 className={`text-xs font-semibold px-1 tracking-wider uppercase ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Danh sách tỉnh thành ({filteredCities.length})
            </h2>
            {filteredCities.length === 0 ? (
              <p className={`text-xs p-4 text-center rounded-xl border ${darkMode ? 'bg-slate-900 border-slate-800 text-slate-500' : 'bg-white border-slate-200 text-slate-400'}`}>
                Không tìm thấy thành phố phù hợp.
              </p>
            ) : (
              filteredCities.map((city) => {
                const isSelected = selectedCity.name === city.name;
                const isFav = favorites.includes(city.name);
                return (
                  <div
                    key={city.name}
                    onClick={() => { setSelectedCity(city); setSimulatingError(false); }}
                    className={`group flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
                      isSelected 
                        ? 'bg-gradient-to-r from-sky-500 to-indigo-600 border-transparent text-white shadow-lg shadow-sky-500/25 scale-[1.02]' 
                        : darkMode 
                          ? 'bg-slate-900 border-slate-800/80 hover:border-slate-700 text-slate-200' 
                          : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-sky-400'}`} />
                      <span className="font-semibold text-base">{city.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => toggleFavorite(city.name, e)}
                        className={`p-1.5 rounded-xl transition-colors ${
                          isFav 
                            ? 'text-amber-400 bg-amber-500/10' 
                            : isSelected ? 'text-white/60 hover:text-white' : darkMode ? 'text-slate-600 hover:text-amber-400' : 'text-slate-300 hover:text-amber-500'
                        }`}
                        title="Thêm vào yêu thích"
                      >
                        <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400' : ''}`} />
                      </button>
                      <ChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-0.5 ${isSelected ? 'text-white' : darkMode ? 'text-slate-600' : 'text-slate-400'}`} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Cột phải: Chi tiết thời tiết (YC2, YC3, YC4) */}
        <section className="md:col-span-8 flex flex-col gap-6">
          
          {/* Trạng thái Đang tải (Loading) */}
          {loading && (
            <div className={`flex flex-col items-center justify-center py-24 rounded-3xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
              <RefreshCw className="w-10 h-10 text-sky-500 animate-spin mb-4" />
              <p className="text-sm font-medium">Đang tải dữ liệu thời tiết cho {selectedCity.name}...</p>
            </div>
          )}

          {/* Trạng thái Lỗi (Error) */}
          {!loading && error && (
            <div className={`p-8 rounded-3xl border border-rose-500/30 flex flex-col items-center text-center ${darkMode ? 'bg-rose-950/20' : 'bg-rose-50'}`}>
              <AlertTriangle className="w-12 h-12 text-rose-500 mb-3" />
              <h3 className="text-lg font-bold text-rose-500 mb-1">Đã có lỗi xảy ra</h3>
              <p className={`text-sm mb-6 max-w-md ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{error}</p>
              <button
                onClick={() => fetchWeather(selectedCity, simulatingError)}
                className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl shadow-lg shadow-rose-500/30 transition-all flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Thử lại ngay
              </button>
            </div>
          )}

          {/* Hiển thị thời tiết thành công */}
          {!loading && !error && weatherData && weatherData.current && (
            <>
              {/* Thẻ Thời tiết hiện tại (YC2) */}
              <div className={`relative overflow-hidden p-6 sm:p-8 rounded-3xl border bg-gradient-to-br ${getWeatherInfo(weatherData.current.weather_code).bg} ${darkMode ? 'border-slate-800' : 'border-slate-200 shadow-sm'}`}>
                <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
                  <Sun className="w-64 h-64" />
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-2xl sm:text-3xl font-extrabold">{selectedCity.name}</h2>
                      {favorites.includes(selectedCity.name) && (
                        <span className="px-2.5 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full">
                          Yêu thích
                        </span>
                      )}
                    </div>
                    <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Cập nhật lúc: {new Date(weatherData.current.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({new Date(weatherData.current.time).toLocaleDateString('vi-VN')})
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                    {getWeatherInfo(weatherData.current.weather_code).icon}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
                  <div>
                    <div className="text-5xl sm:text-6xl font-black tracking-tight mb-1">
                      {convertTemp(weatherData.current.temperature_2m)}
                    </div>
                    <p className="text-base font-medium opacity-90">
                      {getWeatherInfo(weatherData.current.weather_code).text}
                    </p>
                  </div>

                  <div className="sm:col-span-2 grid grid-cols-2 gap-4">
                    <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900/60 border-slate-800/80' : 'bg-white/60 border-white'}`}>
                      <div className="flex items-center gap-2 text-sky-400 mb-1">
                        <Droplets className="w-4 h-4" />
                        <span className={`text-xs font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Độ ẩm</span>
                      </div>
                      <span className="text-2xl font-bold">{weatherData.current.relative_humidity_2m}%</span>
                    </div>

                    <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900/60 border-slate-800/80' : 'bg-white/60 border-white'}`}>
                      <div className="flex items-center gap-2 text-indigo-400 mb-1">
                        <Wind className="w-4 h-4" />
                        <span className={`text-xs font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Tốc độ gió</span>
                      </div>
                      <span className="text-2xl font-bold">{weatherData.current.wind_speed_10m} <span className="text-sm font-normal">km/h</span></span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Thẻ Dự báo 7 ngày (YC3) */}
              <div className={`p-6 rounded-3xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div className="flex items-center gap-2 mb-6">
                  <Calendar className="w-5 h-5 text-sky-500" />
                  <h3 className="text-base font-bold">Dự báo 7 ngày tới</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-7 gap-3">
                  {weatherData.daily.time.map((dateStr, index) => {
                    const dateObj = new Date(dateStr);
                    const dayName = index === 0 ? 'Hôm nay' : dateObj.toLocaleDateString('vi-VN', { weekday: 'short' });
                    const formattedDate = dateObj.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
                    const code = weatherData.daily.weather_code[index];
                    const maxTemp = weatherData.daily.temperature_2m_max[index];
                    const minTemp = weatherData.daily.temperature_2m_min[index];

                    return (
                      <div 
                        key={dateStr}
                        className={`flex flex-col items-center justify-between p-4 rounded-2xl border transition-all hover:scale-105 ${
                          index === 0 
                            ? 'bg-sky-500/10 border-sky-500/40 text-sky-400' 
                            : darkMode ? 'bg-slate-950/40 border-slate-800 hover:border-slate-700' : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="text-center mb-2">
                          <p className="text-xs font-bold uppercase tracking-wider">{dayName}</p>
                          <p className={`text-[11px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{formattedDate}</p>
                        </div>

                        <div className="my-2">
                          {getWeatherInfo(code).icon}
                        </div>

                        <div className="text-center mt-2 w-full">
                          <div className="text-sm font-bold">{convertTemp(maxTemp)}</div>
                          <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{convertTemp(minTemp)}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </section>

      </main>
    </div>
  );
}