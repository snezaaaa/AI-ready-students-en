import React from 'react';
import PromptBuilderBase from '../../ui/PromptBuilderBase.jsx';
import { SLOTS, CARDS, isCardAvailable, assemblePrompt } from './promptPuzzle.js';
import { testPrompt, startDoorSequence } from './logic.js';

export default function PromptBuilder() {
  return (
    <PromptBuilderBase
      title="GRADITELJ PROMPTA" tag="// PROMPTOTRON 3000"
      subtitle="Izaberi po jednu karticu u svakoj koloni. Kartice koje sijaju su one koje si pronašao/la."
      slots={SLOTS} cards={CARDS}
      isAvailable={isCardAvailable}
      lockedText={(slot) => `Još nije pronađeno — potraži dio ${slot.label} u učionici`}
      assemble={assemblePrompt}
      onTest={testPrompt} onSuccess={startDoorSequence}
      thinkingLabel="PROMPTOTRON RAZMIŠLJA…" successFoot="Otključavam vrata…"
    />
  );
}
