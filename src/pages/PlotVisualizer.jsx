import React, { useState } from 'react';
import ScrollButton from '../components/ScrollButton';
import CustomDropdown from '../components/CustomDropdown';
import './PlotVisualizer.css';

const PlotVisualizer = () => {
  const [plotStructure, setPlotStructure] = useState('linear');
  
  const structureOptions = [
    { value: 'linear', label: 'Linear Structure' },
    { value: 'branching', label: 'Branching Plot' }
  ];
  
  const [currentPlot, setCurrentPlot] = useState({
    acts: [
      {
        id: 1,
        title: 'Act I: The Beginning',
        description: 'Introduction of characters and setting',
        events: ['Character introduction', 'World building', 'Inciting incident'],
        completed: false
      },
      {
        id: 2,
        title: 'Act II: The Journey',
        description: 'Rising action and character development',
        events: ['First challenge', 'Character growth', 'Midpoint twist'],
        completed: false
      },
      {
        id: 3,
        title: 'Act III: The Climax',
        description: 'Peak of conflict and resolution',
        events: ['Final confrontation', 'Climax', 'Resolution'],
        completed: false
      }
    ],
    branches: [
      {
        id: 1,
        title: 'Path of Light',
        description: 'Hero chooses the righteous path',
        events: ['Moral decision', 'Sacrifice', 'Redemption'],
        active: false
      },
      {
        id: 2,
        title: 'Path of Shadow',
        description: 'Hero embraces darker powers',
        events: ['Temptation', 'Corruption', 'Dark victory'],
        active: false
      },
      {
        id: 3,
        title: 'Path of Balance',
        description: 'Hero finds middle ground',
        events: ['Compromise', 'Understanding', 'Harmony'],
        active: false
      }
    ]
  });

  const toggleAct = (actId) => {
    setCurrentPlot(prev => ({
      ...prev,
      acts: prev.acts.map(act => 
        act.id === actId ? { ...act, completed: !act.completed } : act
      )
    }));
  };

  const toggleBranch = (branchId) => {
    setCurrentPlot(prev => ({
      ...prev,
      branches: prev.branches.map(branch => 
        branch.id === branchId ? { ...branch, active: !branch.active } : branch
      )
    }));
  };

  const addEvent = (actId) => {
    const newEvent = prompt('Enter new event:');
    if (newEvent) {
      setCurrentPlot(prev => ({
        ...prev,
        acts: prev.acts.map(act => 
          act.id === actId 
            ? { ...act, events: [...act.events, newEvent] }
            : act
        )
      }));
    }
  };

  const generatePlot = () => {
    const plotTemplates = [
      {
        title: 'Hero\'s Journey',
        acts: [
          {
            id: 1,
            title: 'The Call to Adventure',
            description: 'Hero receives a call to leave their ordinary world',
            events: ['Ordinary world', 'Call to adventure', 'Refusal of the call'],
            completed: false
          },
          {
            id: 2,
            title: 'The Road of Trials',
            description: 'Hero faces challenges and meets allies',
            events: ['Crossing the threshold', 'Tests and trials', 'Meeting the mentor'],
            completed: false
          },
          {
            id: 3,
            title: 'The Return',
            description: 'Hero returns transformed with new knowledge',
            events: ['The ordeal', 'The reward', 'Return with elixir'],
            completed: false
          }
        ]
      },
      {
        title: 'Three-Act Structure',
        acts: [
          {
            id: 1,
            title: 'Setup',
            description: 'Establish characters and conflict',
            events: ['Character introduction', 'World establishment', 'Inciting incident'],
            completed: false
          },
          {
            id: 2,
            title: 'Confrontation',
            description: 'Rising action and obstacles',
            events: ['Rising action', 'Midpoint', 'Crisis'],
            completed: false
          },
          {
            id: 3,
            title: 'Resolution',
            description: 'Climax and conclusion',
            events: ['Climax', 'Falling action', 'Resolution'],
            completed: false
          }
        ]
      }
    ];

    const randomTemplate = plotTemplates[Math.floor(Math.random() * plotTemplates.length)];
    setCurrentPlot(prev => ({
      ...prev,
      acts: randomTemplate.acts
    }));
  };

  return (
    <div className="plot-visualizer">
      <div className="visualizer-container">
        <div className="visualizer-header">
          <h1>Plot Visualizer</h1>
          <div className="plot-controls">
            <CustomDropdown
              className="input plot-type"
              options={structureOptions}
              value={plotStructure}
              onChange={(value) => setPlotStructure(value)}
              placeholder="Select Structure..."
            />
            <ScrollButton 
              variant="secondary"
              icon="🎲"
              onClick={generatePlot}
            >
              Generate Plot
            </ScrollButton>
          </div>
        </div>
        
        <div className="plot-content">
          {plotStructure === 'linear' ? (
            <div className="linear-plot">
              <div className="plot-timeline">
                {currentPlot.acts.map((act, index) => (
                  <div key={act.id} className="act-container">
                    <div className={`act-node ${act.completed ? 'completed' : ''}`}>
                      <div className="act-number">{act.id}</div>
                    </div>
                    <div 
                      className="act-content card"
                      onClick={() => toggleAct(act.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="act-header">
                        <h3>{act.title}</h3>
                        <button 
                          className={`toggle-btn ${act.completed ? 'completed' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleAct(act.id);
                          }}
                        >
                        </button>
                      </div>
                      <p className="act-description">{act.description}</p>
                      <div className="act-events">
                        <h4>Key Events:</h4>
                        <ul>
                          {act.events.map((event, eventIndex) => (
                            <li key={eventIndex}>{event}</li>
                          ))}
                        </ul>
                        <button 
                          className="add-event-btn"
                          onClick={() => addEvent(act.id)}
                        >
                          + Add Event
                        </button>
                      </div>
                    </div>
                    {index < currentPlot.acts.length - 1 && (
                      <div className="timeline-connector"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="branching-plot">
              <div className="plot-center">
                <div className="center-node">
                  <h3>Story Start</h3>
                </div>
              </div>
              <div className="plot-branches">
                {currentPlot.branches.map((branch, index) => (
                  <div key={branch.id} className="branch-container">
                    <div className={`branch-path ${branch.active ? 'active' : ''}`}>
                      <div className="branch-node">
                        <div className="branch-number">{branch.id}</div>
                      </div>
                      <div 
                        className="branch-content card"
                        onClick={() => toggleBranch(branch.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="branch-header">
                          <h3>{branch.title}</h3>
                          <button 
                            className={`toggle-btn ${branch.active ? 'completed' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleBranch(branch.id);
                            }}
                          >
                          </button>
                        </div>
                        <p className="branch-description">{branch.description}</p>
                        <div className="branch-events">
                          <h4>Story Events:</h4>
                          <ul>
                            {branch.events.map((event, eventIndex) => (
                              <li key={eventIndex}>{event}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlotVisualizer; 