/**
 * Standalone daily job — use with Task Scheduler, GitHub Actions, or cron:
 *   npm run cron:generate
 */
import './env.js'
import { runScheduledJob } from './scheduler.js'

runScheduledJob()
  .then(({ batchDate, total }) => {
    console.log(`Done — ${total} wallpapers for ${batchDate}`)
    process.exit(0)
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
