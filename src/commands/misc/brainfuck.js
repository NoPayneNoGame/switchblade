const { CommandStructures, SwitchbladeEmbed } = require('../../')
const { Command, CommandParameters, StringParameter } = CommandStructures

module.exports = class Time extends Command {
  constructor (client) {
    super(client)
    this.name = 'brainfuck'
    this.aliases = ['bf']
    this.category = 'general'

    this.parameters = new CommandParameters(this,
      new StringParameter({ full: true, missingError: 'commands:time.invalidTimezone' })
    )
  }

  run ({ t, author, channel }, brainfuck) {
    const embed = new SwitchbladeEmbed(author)
    channel.startTyping()

    const bf = new Brainfuck(brainfuck)
    const output = bf.run()

    embed
      .setTitle(t('commands:'))
      .setDescription(output)
    channel.send(embed).then(() => channel.stopTyping())
  }
}

class Brainfuck {
  constructor (input, memSize = 2048) {
    this.code = new BfCode(input)
    this.memory = new BfMemory(memSize)
    this._output = ''
    this.cmdLimit = 10000
    this.isRunning = false
  }

  run () {
    this._output = ''
    this.isRunning = true

    while (this.isRunning) {
      const cmd = this.code.get()

      console.log(this.memory.pointer, this.memory.current())

      switch (cmd) {
        case '>':
          this.memory.next()
          break
        case '<':
          this.memory.prev()
          break
        case '+':
          this.memory.increase()
          break
        case '-':
          this.memory.decrease()
          break
        case ',':
          this.input()
          break
        case '.':
          this.output()
          break
        case '[' && this.memory.current() === 0:
          this.code.jumpToMatching()
          break
        case ']':
          this.code.jumpToMatching()
          break
        case 'default':
          // Ignore everything else
          break
      }

      this.isRunning = this.code.next()
    }

    return this._output
  }

  input () {

  }

  output () {
    this._output += String.fromCharCode(this.memory.current())
  }
}

class BfMemory {
  constructor (size = 2048) {
    this.pointer = 0
    this.memSize = size
    this.memory = new Array(size).fill(0)
  }

  next () {
    if (this.pointer < this.memSize) {
      this.pointer++
    } else {
      throw new Error('Out of Bounds in Brainfuck Memory')
    }
  }

  prev () {
    if (this.pointer > 0) {
      this.pointer--
    } else {
      throw new Error('Out of Bounds in Brainfuck Memory')
    }
  }

  increase () {
    this.memory[this.pointer]++
  }

  decrease () {
    this.memory[this.pointer]--
  }

  current () {
    return this.memory[this.pointer]
  }
}

class BfCode {
  constructor (input) {
    this.code = input
    this.instPointer = 0
  }

  get () {
    return this.code[this.instPointer]
  }

  next () {
    this.instPointer++
    return typeof this.get() !== 'undefined'
  }

  jumpToMatching () {
    if (this.get() === '[') {
      this.instPointer = this.code
        .substring(this.instPointer)
        .indexOf(']') + 1
    } else if (this.get() === ']') {

    }
  }
}
