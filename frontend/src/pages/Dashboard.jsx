import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sprout, LogOut, Camera, Plus, Flower2, Droplet, Thermometer, Sun } from 'lucide-react';
import api from '../api/api';

function Dashboard() {
  const navigate = useNavigate();
  const [devices, setDevices] = useState([]);
  const [readings, setReadings] = useState({});
  const [loading, setLoading] = useState(true);

  const userEmail = localStorage.getItem('userEmail') || '';
  const initials = userEmail
    ? userEmail.split('@')[0].slice(0, 2).toUpperCase()
    : 'U';

  useEffect(() => {
    const loadData = async () => {
      try {
        const devicesRes = await api.get('/devices');
        setDevices(devicesRes.data);

        const readingsMap = {};
        await Promise.all(
          devicesRes.data.map(async (device) => {
            try {
              const r = await api.get(`/sensors/latest/${device.id}`);
              readingsMap[device.id] = r.data;
            } catch {
              readingsMap[device.id] = null;
            }
          })
        );
        setReadings(readingsMap);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    navigate('/');
  };

  const onlineCount = devices.length;

  return (
    <div className="min-h-screen bg-bgPage font-sans">

      {/* top navigation */}
      <div className="w-full h-[72px] bg-white border-b border-borderLight flex flex-row justify-between items-center px-16 box-border">
        <div className="flex flex-row items-center gap-2.5">
          <div className="w-8 h-8 bg-primary rounded-[10px] flex justify-center items-center">
            <Sprout size={18} className="text-white" />
          </div>
          <span className="font-extrabold text-base text-textDark">FloraShield</span>
        </div>

        <div className="flex flex-row items-center gap-8 h-full">
          <button className="h-full flex flex-col justify-center items-center gap-5 relative">
            <span className="font-semibold text-sm text-primary">Home</span>
            <span className="absolute bottom-0 w-full h-0.5 bg-primary rounded-full" />
          </button>
          <button
            onClick={() => navigate('/devices')}
            className="h-full flex flex-col justify-center items-center gap-5"
          >
            <span className="font-medium text-sm text-textMuted">Devices</span>
          </button>
          <button
            onClick={() => navigate('/history')}
            className="h-full flex flex-col justify-center items-center gap-5"
          >
            <span className="font-medium text-sm text-textMuted">History</span>
          </button>
        </div>

        <div className="flex flex-row items-center gap-5">
          <div className="flex flex-row items-center gap-2">
            <div className="w-8 h-8 bg-iconGreenBg rounded-full flex justify-center items-center">
              <span className="font-bold text-xs text-primary">{initials}</span>
            </div>
            <span className="font-medium text-[13px] text-textDark">{userEmail}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex flex-row items-center gap-1.5 px-3.5 py-2 border border-borderLight rounded-lg"
          >
            <LogOut size={14} className="text-textMuted" />
            <span className="font-semibold text-[13px] text-textMuted">Logout</span>
          </button>
        </div>
      </div>

      {/* dashboard body */}
      <div className="flex flex-col items-start gap-8 px-16 py-10 max-w-[1440px] mx-auto">

        {/* header row */}
        <div className="flex flex-row justify-between items-center w-full flex-wrap gap-4">
          <div className="flex flex-col gap-1.5">
            <h1 className="font-extrabold text-[28px] text-textDark">Farm Dashboard</h1>
            <p className="text-sm text-textMuted">
              Monitoring health of {devices.length} botanical {devices.length === 1 ? 'quadrant' : 'quadrants'} across your farm.
            </p>
          </div>
          <div className="flex flex-row items-center gap-2 px-4 py-2 bg-iconGreenBg rounded-full">
            <span className="w-2 h-2 bg-primary rounded-full" />
            <span className="font-semibold text-[13px] text-primary">
              All {onlineCount} Telemetry Pot {onlineCount === 1 ? 'Device' : 'Devices'} Online
            </span>
          </div>
        </div>

        {/* analyze hero banner */}
        <div className="w-full flex flex-row items-center gap-10 p-12 bg-white border-2 border-primary shadow-[0px_16px_32px_rgba(27,67,50,0.08)] rounded-3xl box-border flex-wrap">
          <div className="w-[320px] h-[200px] bg-gradient-to-br from-green-200 to-green-500 rounded-2xl flex-shrink-0" />

          <div className="flex flex-col gap-5 flex-1 min-w-[300px]">
            <div className="flex flex-col gap-2">
              <div className="flex flex-row items-center gap-2">
                <div className="px-2 py-1 bg-iconGreenBg rounded-md">
                  <span className="font-bold text-[11px] uppercase text-primary">New AI Engine v4.2</span>
                </div>
                <span className="text-xs text-textMuted">• 99.4% Diagnosis Accuracy</span>
              </div>
              <h2 className="font-extrabold text-2xl text-textDark">Botanical Disease & Crop Health Detector</h2>
              <p className="text-sm text-textMuted leading-[150%]">
                Take a photograph or upload an image of a symptomatic crop leaf. Our deep-learning networks
                immediately diagnose fungal, bacterial, or environmental infections and map current telemetry correlations.
              </p>
            </div>

            <button
              onClick={() => navigate('/analyze/step1')}
              className="flex flex-row items-center gap-2.5 px-6 py-3.5 bg-primary hover:bg-primaryDark rounded-[10px] w-fit transition"
            >
              <Camera size={18} className="text-white" />
              <span className="font-bold text-[15px] text-white">Diagnose Symptomatic Plant Now</span>
            </button>
          </div>
        </div>

        {/* devices section heading */}
        <div className="flex flex-row justify-between items-center w-full flex-wrap gap-4">
          <div className="flex flex-col gap-1">
            <h3 className="font-bold text-lg text-textDark">Active Telemetry Pots</h3>
            <p className="text-[13px] text-textMuted">Real-time agricultural environment data streaming from active pots.</p>
          </div>
          <button
            onClick={() => navigate('/devices')}
            className="flex flex-row items-center gap-2 px-4 py-2.5 border-[1.5px] border-primary rounded-lg"
          >
            <Plus size={16} className="text-primary" />
            <span className="font-bold text-sm text-primary">Add Telemetry Pot</span>
          </button>
        </div>

        {/* devices grid */}
        {loading ? (
          <p className="text-textMuted text-sm">Loading telemetry pots...</p>
        ) : devices.length === 0 ? (
          <div className="w-full py-12 flex flex-col items-center gap-3 bg-white border border-borderLight rounded-2xl">
            <Flower2 size={32} className="text-textMuted" />
            <p className="text-textMuted text-sm">No telemetry pots yet — add your first device to start tracking.</p>
          </div>
        ) : (
          <div className="flex flex-row flex-wrap gap-6 w-full">
            {devices.map((device) => {
              const reading = readings[device.id];
              const isDry = reading && reading.soil_moisture < 40;

              return (
                <div
                  key={device.id}
                  className="flex-1 min-w-[320px] flex flex-col gap-5 p-6 bg-white border border-borderLight rounded-2xl box-border"
                >
                  <div className="flex flex-row justify-between items-center">
                    <div className="flex flex-row items-center gap-2.5">
                      <div className="w-9 h-9 bg-iconGreenBg rounded-lg flex justify-center items-center">
                        <Flower2 size={18} className="text-primary" />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-[15px] text-textDark">{device.name}</span>
                        <span className="text-[11px] text-textMuted">ID: #{device.id}</span>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-md ${isDry ? 'bg-red-100' : 'bg-iconGreenBg'}`}>
                      <span className={`font-semibold text-[11px] ${isDry ? 'text-red-600' : 'text-primary'}`}>
                        {!reading ? 'NO DATA' : isDry ? 'DRY ALERT' : 'EXCELLENT'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-row gap-4">
                    <div className={`flex-1 flex flex-col gap-1 p-3 rounded-lg ${isDry ? 'bg-red-100' : 'bg-bgPage'}`}>
                      <div className="flex items-center gap-1">
                        <Droplet size={11} className={isDry ? 'text-red-600' : 'text-textMuted'} />
                        <span className={`text-[11px] ${isDry ? 'text-red-600' : 'text-textMuted'}`}>MOISTURE</span>
                      </div>
                      <span className={`font-bold text-base ${isDry ? 'text-red-600' : 'text-iconBlue'}`}>
                        {reading ? `${reading.soil_moisture}%` : '—'}
                      </span>
                    </div>
                    <div className="flex-1 flex flex-col gap-1 p-3 bg-bgPage rounded-lg">
                      <div className="flex items-center gap-1">
                        <Thermometer size={11} className="text-textMuted" />
                        <span className="text-[11px] text-textMuted">TEMP</span>
                      </div>
                      <span className="font-bold text-base text-textDark">
                        {reading ? `${reading.temperature}°C` : '—'}
                      </span>
                    </div>
                    <div className="flex-1 flex flex-col gap-1 p-3 bg-bgPage rounded-lg">
                      <div className="flex items-center gap-1">
                        <Sun size={11} className="text-textMuted" />
                        <span className="text-[11px] text-textMuted">HUMIDITY</span>
                      </div>
                      <span className="font-bold text-base" style={{ color: '#AACC00' }}>
                        {reading ? `${reading.air_humidity}%` : '—'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;