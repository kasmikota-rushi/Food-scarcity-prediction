import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './index.css';

const districts = [
    'Anantapur', 'Chittoor', 'East Godavari', 'Guntur', 'Krishna',
    'Kurnool', 'Prakasam', 'Srikakulam', 'Sri Potti Sriramulu Nellore',
    'Visakhapatnam', 'Vizianagaram', 'West Godavari', 'YSR Kadapa'
];

const crops = ['Rice', 'Maize', 'Groundnut', 'Cotton', 'Sugarcane', 'Chilies'];
const seasons = ['Kharif', 'Rabi', 'Summer'];

function App() {
    const [activeTab, setActiveTab] = useState('predict');
    const [chatMessages, setChatMessages] = useState([
        { role: 'ai', content: 'Hello! I am your AI Agriculture Assistant for Andhra Pradesh. How can I help you today?' }
    ]);
    const [currentMsg, setCurrentMsg] = useState('');
    const [formData, setFormData] = useState({
        region: districts[0],
        population: 1500000,
        season: seasons[0],
        crop: crops[0],
        rainfall: 800,
        temperature: 28.5,
        area_cultivated: 10000
    });

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            // Assuming backend runs on port 8000 locally
            const response = await fetch('http://localhost:8000/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Prediction service is unavailable. Please ensure the backend is running.');
            }

            const data = await response.json();

            // Mock metrics for the chart based roughly on the inputs, just for visualization purposes
            // In a real application, the backend API should return these exact scaled numbers.
            const estimatedProduction = formData.area_cultivated * (formData.crop === 'Rice' ? 3.5 : 2.5);
            const estimatedDemand = formData.population * 0.05;

            setResult({
                ...data,
                chartData: [
                    { name: 'Metrics (Tons)', Production: estimatedProduction, Demand: estimatedDemand }
                ]
            });
            // Switch to dashboard tab seamlessly upon successfully getting results
            setActiveTab('dashboard');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!currentMsg.trim()) return;

        const newChat = [...chatMessages, { role: 'user', content: currentMsg }];
        setChatMessages(newChat);
        setCurrentMsg('');

        // Mock simple AI responses based on keywords
        setTimeout(() => {
            let aiResponse = "I'm sorry, I couldn't understand that. Could you ask about crops, scarcity, or weather?";
            const msgLower = newChat[newChat.length - 1].content.toLowerCase();

            if (msgLower.includes('rice') || msgLower.includes('paddy')) {
                aiResponse = "Rice in Andhra Pradesh usually requires about 1200-1500mm of water. If predictions show scarcity, consider SRI method or alternating with Maize.";
            } else if (msgLower.includes('weather') || msgLower.includes('rain')) {
                aiResponse = "Rainfall patterns in Andhra Pradesh are heavily influenced by the SW Monsoon (June-September) and NE Monsoon (October-December).";
            } else if (msgLower.includes('groundnut')) {
                aiResponse = "Groundnut is highly drought-resistant and an excellent rotation crop for regions like Anantapur.";
            } else if (msgLower.includes('fertilizer') || msgLower.includes('soil')) {
                aiResponse = "Before applying fertilizer, I recommend getting a soil health card from your local block agricultural office to optimize NPK ratios.";
            }

            setChatMessages(prev => [...prev, { role: 'ai', content: aiResponse }]);
        }, 1000);
    };

    return (
        <div className="app-container">
            <div className="background-shapes">
                <div className="shape shape-1"></div>
                <div className="shape shape-2"></div>
                <div className="shape shape-3"></div>
            </div>

            <main className="main-content">
                <header className="header">
                    <h1>Andhra Pradesh Food Scarcity Predictor</h1>
                    <p>AI-Powered Crop Supply Forecasting System</p>
                </header>

                <div className="glass-panel main-panel">

                    <div className="tabs">
                        <button
                            className={`tab-btn ${activeTab === 'predict' ? 'active' : ''}`}
                            onClick={() => setActiveTab('predict')}
                        >
                            Predictive Engine
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
                            onClick={() => setActiveTab('dashboard')}
                            disabled={!result}
                        >
                            Analysis Dashboard
                        </button>
                    </div>

                    {activeTab === 'predict' && (
                        <div className="tab-content fade-in">
                            <form onSubmit={handleSubmit} className="prediction-form">
                                <div className="form-grid">

                                    <div className="form-group">
                                        <label>Region (District)</label>
                                        <select name="region" value={formData.region} onChange={handleChange}>
                                            {districts.map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>Population Area Served</label>
                                        <input
                                            type="number"
                                            name="population"
                                            value={formData.population}
                                            onChange={handleChange}
                                            min="1000"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Growing Season</label>
                                        <select name="season" value={formData.season} onChange={handleChange}>
                                            {seasons.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>Crop Type</label>
                                        <select name="crop" value={formData.crop} onChange={handleChange}>
                                            {crops.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>

                                    {/* Advanced metrics - optional for users but good for ML */}
                                    <div className="form-group">
                                        <label>Est. Rainfall (mm)</label>
                                        <input
                                            type="number"
                                            name="rainfall"
                                            value={formData.rainfall}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Avg Temperature (°C)</label>
                                        <input
                                            type="number"
                                            name="temperature"
                                            value={formData.temperature}
                                            onChange={handleChange}
                                            step="0.1"
                                        />
                                    </div>

                                </div>

                                <button type="submit" className="submit-btn" disabled={loading}>
                                    {loading ? <span className="loader"></span> : 'Generate AI Prediction'}
                                </button>
                            </form>

                            {error && (
                                <div className="alert error fade-in">
                                    <p>{error}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'dashboard' && result && (
                        <div className="dashboard tab-content fade-in">
                            <div className={`result-card status-${result.prediction.toLowerCase()}`}>
                                <h2>Model Prediction</h2>
                                <div className="status-badge">
                                    {result.prediction}
                                </div>

                                <div className="confidence-meter">
                                    <div className="meter-header">
                                        <span>AI Confidence Score</span>
                                        <span>{result.confidence}%</span>
                                    </div>
                                    <div className="meter-track">
                                        <div
                                            className="meter-fill"
                                            style={{ width: `${result.confidence}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <p className="result-message">{result.message}</p>

                                {result.recommendation && (
                                    <div className="recommendation-box mt-4 p-4 rounded bg-slate-800 border border-slate-700">
                                        <h3 style={{ color: '#fcd34d', marginBottom: '8px' }}>💡 AI Recommendation</h3>
                                        <p style={{ fontSize: '0.95rem', color: '#e2e8f0' }}>{result.recommendation}</p>
                                    </div>
                                )}
                            </div>

                            <div className="chart-container" style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '1rem', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                                <h3 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#94a3b8' }}>Estimated Production vs Demand Analytics</h3>
                                <div style={{ width: '100%', height: 300 }}>
                                    <ResponsiveContainer>
                                        <BarChart
                                            data={result.chartData}
                                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                            <XAxis dataKey="name" stroke="#94a3b8" />
                                            <YAxis stroke="#94a3b8" />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                                itemStyle={{ color: '#fff' }}
                                            />
                                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                            <Bar dataKey="Production" fill="#10b981" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="Demand" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'chat' && (
                        <div className="chat-container tab-content fade-in" style={{ height: '500px', display: 'flex', flexDirection: 'column' }}>
                            <div className="chat-history" style={{ flex: 1, overflowY: 'auto', padding: '1rem', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '1rem', marginBottom: '1rem' }}>
                                {chatMessages.map((msg, idx) => (
                                    <div key={idx} style={{
                                        marginBottom: '1rem',
                                        display: 'flex',
                                        justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
                                    }}>
                                        <div style={{
                                            maxWidth: '75%',
                                            padding: '0.8rem 1.2rem',
                                            borderRadius: msg.role === 'user' ? '20px 20px 0 20px' : '20px 20px 20px 0',
                                            background: msg.role === 'user' ? 'var(--primary-color)' : 'rgba(255,255,255,0.1)',
                                            color: '#fff',
                                            fontSize: '0.95rem',
                                            lineHeight: '1.4'
                                        }}>
                                            {msg.content}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.5rem' }}>
                                <input
                                    type="text"
                                    value={currentMsg}
                                    onChange={(e) => setCurrentMsg(e.target.value)}
                                    placeholder="Ask about crops, soils, or weather..."
                                    style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: '2rem' }}
                                />
                                <button type="submit" className="submit-btn" style={{ width: 'auto', borderRadius: '2rem', padding: '0 1.5rem', minHeight: 'auto' }}>
                                    Send
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default App;
