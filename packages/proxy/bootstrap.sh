# # build the cargo packages 
cd ../tlsn
sh ./build_examples.sh

# # copy the binaries from there to here
cp ./tlsn/target/release/examples/simple_notary ../proxy/bin/simple_notary
cp ./tlsn/target/release/examples/simple_prover ../proxy/bin/simple_prover
cp ./tlsn/target/release/examples/simple_verifier ../proxy/bin/simple_verifier