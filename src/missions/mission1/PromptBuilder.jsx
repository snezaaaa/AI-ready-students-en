import React from 'react';
import PromptBuilderBase from '../../ui/PromptBuilderBase.jsx';
import { SLOTS, CARDS, isCardAvailable, assemblePrompt } from './promptPuzzle.js';
import { testPrompt, startDoorSequence } from './logic.js';

export default function PromptBuilder() {
  return (
    <PromptBuilderBase
      title="PROMPT BUILDER" tag="// PROMPTOTRON 3000"
      subtitle="Pick one card in each column. The glowing cards are the ones you found."
      slots={SLOTS} cards={CARDS}
      isAvailable={isCardAvailable}
      lockedText={(slot) => `Not found yet — look for the ${slot.label} part in the classroom`}
      assemble={assemblePrompt}
      onTest={testPrompt} onSuccess={startDoorSequence}
      thinkingLabel="PROMPTOTRON IS THINKING…" successFoot="Unlocking the door…"
    />
  );
}
