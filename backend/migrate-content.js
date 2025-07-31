const { runQuery, getRow, getAll } = require('./database');
const migrateContent = async () => {
  try {
    console.log('Starting content migration...');
    
    const stories = await getAll('SELECT id, content, created_at FROM stories WHERE content IS NOT NULL AND content != ""');
    
    console.log(`Found ${stories.length} stories with content to migrate`);
    
    for (const story of stories) {
      try {
        JSON.parse(story.content);
        console.log(`Story ${story.id}: Content is already valid JSON`);
      } catch (error) {
        console.log(`Story ${story.id}: Converting plain text to JSON format`);
        
        const newContent = JSON.stringify([{
          type: 'user',
          content: story.content,
          timestamp: story.created_at || new Date().toISOString()
        }]);
        
        await runQuery(
          'UPDATE stories SET content = ? WHERE id = ?',
          [newContent, story.id]
        );
        
        console.log(`Story ${story.id}: Successfully migrated`);
      }
    }
    
    console.log('Content migration completed successfully!');
  } catch (error) {
    console.error('Error during content migration:', error);
  }
};
if (require.main === module) {
  migrateContent().then(() => {
    console.log('Migration script finished');
    process.exit(0);
  }).catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
}
module.exports = { migrateContent }; 