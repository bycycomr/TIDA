# Model Placeholder

This directory will contain your trained TensorFlow.js model after you complete the training pipeline.

## Expected Files

After running the training pipeline, this directory should contain:

```
model/
├── model.json              # Model architecture
├── group1-shard1of1.bin    # Model weights
├── model_metadata.json     # Model metadata
└── label_mapping.json      # Label to class mapping
```

## How to Add Your Model

1. Complete the ML training pipeline in `ml-training/`
2. Run the export script:
   ```bash
   cd ml-training
   python export_model.py --input ./model --output ../public/model
   ```
3. The model files will be automatically copied here

## Using Mock Predictions

Until you train a real model, the application uses mock predictions for demonstration purposes. See `src/ml/predictLetter.ts` for the mock implementation.

To switch to the real model:
1. Train and export your model to this directory
2. Update `src/App.tsx` to uncomment the real model loading code
3. Restart the development server
