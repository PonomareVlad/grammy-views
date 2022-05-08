import { Bot, session } from 'grammy'

import { config } from './core/config'
import { CustomContext } from './types/context'

import callbackQuery from './passThruMiddlewares/callbackQuery'
import { ViewController } from './lib/viewController'
import { MainView } from './views/main'
import { ItemView } from './views/item'
import { FileAdapter } from '@grammyjs/storage-file'
import { CreateItemView } from './views/createItem'
import { ItemListView } from './views/itemList'

export function getBot() {
  const bot = new Bot<CustomContext>(config.token)

  bot.use(callbackQuery)
  bot.use(session({
    initial: () => ({ __views: { current: '', state: undefined }, items: [] }),
    storage: new FileAdapter({ dirName: 'sessions' }),
  }))

  const viewController = new ViewController<CustomContext>()
  viewController.register(
    MainView,
    ItemListView,
    ItemView,
    CreateItemView,
  )

  bot.use(viewController)

  bot.catch(console.error)

  return bot
}
