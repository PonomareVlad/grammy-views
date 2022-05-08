import { View } from '../lib/view'
import { CustomContext } from '../types/context'
import { items } from '../data/items'
import { goToMainMenu } from './main'
import { Codec } from '../lib/codec'

export const GoToItemCodec = new Codec<{ id: number }>({
  encode(data) {
    return `go-to-item-${data.id}`
  },
  decode(s) {
    const match = s.match(/^go-to-item-(\d+)$/)
    if (!match) {
      return null
    }
    return {
      id: Number(match[1]),
    }
  },
})
export const goToItem = (id: number) => GoToItemCodec.encode({ id })

export const ItemView = new View<CustomContext, { id: number }>('item')
ItemView.render((ctx) => {
  const item = items[ctx.view.state.id]
  if (!item) {
    ctx.answerCallbackQuery({
      text: 'Item not found',
    })
    return ctx.view.revert()
  }
  const keyboard = [
    [{ text: 'Show my session data', callback_data: 'state' }],
  ]
  const navigationRow = []
  if (ctx.view.state.id > 0) {
    navigationRow.push({
      text: '<',
      callback_data: goToItem(ctx.view.state.id - 1),
    })
  }
  if (ctx.view.state.id < items.length - 1) {
    navigationRow.push({
      text: '>',
      callback_data: goToItem(ctx.view.state.id + 1),
    })
  }
  keyboard.push(navigationRow)
  keyboard.push([{ text: 'Go to main menu', callback_data: goToMainMenu() }])
  const answer = (...args: Parameters<typeof ctx['editMessageText']>) => ctx.callbackQuery ? ctx.editMessageText(...args) : ctx.reply(...args)
  return answer(`Item ${item} (${ctx.view.state.id})`, {
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: keyboard,
    },
  })
})
ItemView.global.filter(GoToItemCodec.filter, (ctx) => ctx.view.enter(ItemView, { id: ctx.codec.id }))
ItemView.callbackQuery('state', (ctx) => ctx.answerCallbackQuery({ text: JSON.stringify(ctx.view.session), show_alert: true }))
