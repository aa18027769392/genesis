const async  = require('async')
const bn     = require('bignumber.js')
const Wallet = require('./Wallet')
const util = require('../utilities')

class WalletTestnet extends Wallet {

  process_key( complete = () => {} ){
    this.maybe_fix_key()
    complete()
  }

  process_balance_wallet( complete = () => {} ){
    util.balance.wallet_cumulative( this.address, this.transfers, balance => {
      this.balance.set( 'wallet', balance)
      complete()
    })
  }

  process_balance_unclaimed( complete = () => {} ){
    util.balance.unclaimed( this.address, this.buys, this.claims, this.config.period, balance => {
      this.balance.set( 'unclaimed', balance )
      complete()
    })
  }

  process_balance_reclaimed( complete = () => {} ){
    util.balance.reclaimed( this.address, this.reclaimables, balance => {
      this.balance.set( 'reclaimed', balance )
      complete()
    })
  }

  process_balance_sum( complete = () => {} ){
    this.balance.sum()
    complete()
  }

  process_balance_from_wei( complete = () => {} ){
    this.balance.from_wei()
    complete()
  }

  process_judgement( complete = () => {} ){
    this.valid() ? this.accept() : this.reject()

    // if(util.misc.is_eos_public_key(this.eos_key) && !this.registered)
    //   console.log(this),
    //   process.exit()
    //
    // if(this.balance.total.gte(1) && this.register_error == "balance_insufficient")
    //   console.log(this),
    //   console.log(this.balance.total.toFixed(4), this.balance.total.lt(1)),
    //   process.exit()

    complete()
  }

  process_exclude(complete){
    const exclude = [CS_ADDRESS_CROWDSALE, CS_ADDRESS_TOKEN]
    if(!this.config.include_b1) exclude.push(CS_ADDRESS_B1)
    if(exclude.indexOf(this.address.toLowerCase()) > -1)
      this.accepted           = false,
      this.register_error     = 'exclude'
    complete()
  }

  process( callback ) {
    async.series([
      ( complete ) => this.process_key( complete ),
      ( complete ) => this.process_balance_wallet( complete ),
      ( complete ) => this.process_balance_unclaimed( complete ),
      ( complete ) => this.process_balance_reclaimed( complete ),
      ( complete ) => this.process_balance_sum( complete ),
      ( complete ) => this.process_balance_from_wei( complete ),
      ( complete ) => this.process_judgement( complete ),
      ( complete ) => this.process_exclude( complete )
    ],(err, result) => {
      this.balance.format()
      callback( this.json() )
    })
  }
}

module.exports = WalletTestnet
