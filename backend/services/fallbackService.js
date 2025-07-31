class FallbackService {
  constructor() {
    this.plotTwists = [
      {
        title: "The Hidden Truth",
        description: "A character discovers that everything they believed about their past is a carefully constructed lie.",
        category: "Character",
        impact: "High",
        icon: "?"
      },
      {
        title: "Unexpected Ally",
        description: "The main antagonist turns out to be working against an even greater threat.",
        category: "Plot",
        impact: "Medium",
        icon: "&"
      },
      {
        title: "Time Loop Reveal",
        description: "The protagonist realizes they've been repeating the same events multiple times.",
        category: "Plot",
        impact: "High",
        icon: "O"
      },
      {
        title: "Mirror World",
        description: "The setting is revealed to be a parallel universe or simulation.",
        category: "Setting",
        impact: "High",
        icon: "="
      },
      {
        title: "Identity Swap",
        description: "Two characters have secretly switched places or identities.",
        category: "Character",
        impact: "Medium",
        icon: "~"
      }
    ];
    this.storySuggestions = [
      {
        title: "The Last Library",
        synopsis: "In a world where books are forbidden, a librarian discovers a hidden collection that could change everything.",
        characters: "The librarian, the enforcer, the rebel",
        conflict: "Preserving knowledge vs. maintaining control"
      },
      {
        title: "Echoes of Tomorrow",
        synopsis: "A scientist receives messages from their future self, warning of an impending disaster.",
        characters: "The scientist, the future self, the government agent",
        conflict: "Changing the future vs. accepting fate"
      },
      {
        title: "The Memory Garden",
        synopsis: "A gardener discovers plants that can store and replay human memories.",
        characters: "The gardener, the memory thief, the lost soul",
        conflict: "Preserving memories vs. letting go"
      }
    ];
    this.characterTemplates = [
      {
        description: "A complex individual with hidden depths and conflicting motivations.",
        traits: "Determined, conflicted, resourceful, haunted by past mistakes",
        background: "A troubled past that shaped their current path, with secrets they keep hidden",
        motivations: "Driven by a desire for redemption and the need to protect what matters most"
      },
      {
        description: "A charismatic leader who may not be what they seem on the surface.",
        traits: "Charming, manipulative, intelligent, ambitious",
        background: "Rose from humble beginnings through cunning and determination",
        motivations: "Seeks power and control, but has a hidden agenda that drives their actions"
      },
      {
        description: "An ordinary person thrust into extraordinary circumstances.",
        traits: "Reluctant hero, practical, loyal, growing in confidence",
        background: "Lived a normal life until events forced them to take action",
        motivations: "Protecting loved ones and doing what's right, even when it's difficult"
      }
    ];
  }
  generatePlotTwist(storyContext = '', genre = '') {
    // Select a random twist, but try to match genre if provided
    let selectedTwist = this.plotTwists[Math.floor(Math.random() * this.plotTwists.length)];
    
    // Simple genre matching
    if (genre) {
      const genreLower = genre.toLowerCase();
      if (genreLower.includes('mystery') || genreLower.includes('thriller')) {
        selectedTwist = this.plotTwists.find(twist => 
          twist.title.includes('Hidden') || twist.title.includes('Identity')
        ) || selectedTwist;
      } else if (genreLower.includes('sci-fi') || genreLower.includes('fantasy')) {
        selectedTwist = this.plotTwists.find(twist => 
          twist.title.includes('Mirror') || twist.title.includes('Time')
        ) || selectedTwist;
      }
    }
    
    return selectedTwist;
  }
  continueStory(storyContent, direction = '') {
    const continuations = [
      "The tension in the room was palpable as everyone waited for the next move. Shadows danced on the walls, and the air seemed to thicken with anticipation. Something was about to change, and they all knew it.",
      
      "A sudden realization hit like a thunderbolt. Everything that had happened before now made sense in a way that was both terrifying and liberating. The truth had been there all along, hidden in plain sight.",
      
      "The world around them seemed to shift and blur, as if reality itself was questioning what was real and what was merely a construct of their imagination. Nothing would ever be the same again.",
      
      "In the distance, a sound echoed that sent chills down their spine. It was a sound they had heard before, but this time it carried a different meaning, a different threat. Time was running out.",
      
      "The choice before them was impossible, but they had to make it. Every option led to consequences they couldn't fully predict, but standing still was no longer an option. The moment of decision had arrived."
    ];
    
    return continuations[Math.floor(Math.random() * continuations.length)];
  }
  developCharacter(characterName, currentTraits = '', storyContext = '') {
    const template = this.characterTemplates[Math.floor(Math.random() * this.characterTemplates.length)];
    
    return {
      description: `${characterName} is ${template.description}`,
      traits: template.traits,
      background: template.background,
      motivations: template.motivations
    };
  }
  generateStorySuggestions(genre = '', theme = '') {
    return this.storySuggestions;
  }
  generateContentWithRetry(prompt) {
    return "I'm sorry, but I'm currently experiencing technical difficulties. Please try again later.";
  }
  generateCharacterFromStory(storyContent, characterName = '') {
    const template = this.characterTemplates[Math.floor(Math.random() * this.characterTemplates.length)];
    return {
      name: characterName || 'New Character',
      role: 'Supporting',
      age: 'Unknown',
      origin: 'Unknown',
      motivation: template.motivations,
      description: template.description,
      backstory: template.background,
      traits: template.traits,
      relationships: 'Connections to be explored'
    };
  }
  generatePlotFromStory(storyContent, plotType = 'three-act') {
    return {
      title: 'Story Plot Structure',
      structure_type: plotType,
      acts: 'Act 1: Setup, Act 2: Confrontation, Act 3: Resolution',
      branches: 'Main plot with potential subplots'
    };
  }
  generateContent(prompt) {
    return "I'm sorry, but I'm currently experiencing technical difficulties. Please try again later.";
  }
}
module.exports = new FallbackService(); 