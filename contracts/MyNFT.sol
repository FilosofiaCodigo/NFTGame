// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract MyNFT is ERC721 {
    uint256 token_count;

    constructor() ERC721("My NFT", "MNFT") {}

    function mintNFT(address to) public
    {
        token_count  += 1;
        _mint(to, token_count);
    }
}