# Developers

## Troubleshooting

### HowLongToBeat

- If the HLTB search is failing with 401/403, check the init and search URLs on the HLTB website — they change them regularly.
  - To fix, update `hltb-api.ts` and the Supabase edge function. Serve locally:

  ```sh
  supabase start
  supabase functions serve hltb-search
  ```

  Then deploy:

  ```sh
  supabase functions deploy hltb-search
  ```
