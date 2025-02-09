import * as anchor from '@coral-xyz/anchor'
import {Program} from '@coral-xyz/anchor'
import {Keypair} from '@solana/web3.js'
import {Soljar} from '../target/types/soljar'

describe('soljar', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)
  const payer = provider.wallet as anchor.Wallet

  const program = anchor.workspace.Soljar as Program<Soljar>

  const soljarKeypair = Keypair.generate()

  it('Initialize Soljar', async () => {
    await program.methods
      .initialize()
      .accounts({
        soljar: soljarKeypair.publicKey,
        payer: payer.publicKey,
      })
      .signers([soljarKeypair])
      .rpc()

    const currentCount = await program.account.soljar.fetch(soljarKeypair.publicKey)

    expect(currentCount.count).toEqual(0)
  })

  it('Increment Soljar', async () => {
    await program.methods.increment().accounts({ soljar: soljarKeypair.publicKey }).rpc()

    const currentCount = await program.account.soljar.fetch(soljarKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Increment Soljar Again', async () => {
    await program.methods.increment().accounts({ soljar: soljarKeypair.publicKey }).rpc()

    const currentCount = await program.account.soljar.fetch(soljarKeypair.publicKey)

    expect(currentCount.count).toEqual(2)
  })

  it('Decrement Soljar', async () => {
    await program.methods.decrement().accounts({ soljar: soljarKeypair.publicKey }).rpc()

    const currentCount = await program.account.soljar.fetch(soljarKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Set soljar value', async () => {
    await program.methods.set(42).accounts({ soljar: soljarKeypair.publicKey }).rpc()

    const currentCount = await program.account.soljar.fetch(soljarKeypair.publicKey)

    expect(currentCount.count).toEqual(42)
  })

  it('Set close the soljar account', async () => {
    await program.methods
      .close()
      .accounts({
        payer: payer.publicKey,
        soljar: soljarKeypair.publicKey,
      })
      .rpc()

    // The account should no longer exist, returning null.
    const userAccount = await program.account.soljar.fetchNullable(soljarKeypair.publicKey)
    expect(userAccount).toBeNull()
  })
})
