"""
Test Suite for LexSphere Citation Verification System.
Executes test cases to validate verification engine accuracy against legal judgments.
"""

import sys
import os
import json

# Add current directory to path
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from citation_checker import verify_legal_text_citations


def test_citation_verification():
    print("=" * 60)
    print("RUNNING CITATION VERIFICATION TEST SUITE")
    print("=" * 60)

    # Test Case 1: Valid Judgment
    test_1_input = "Rashmi Kant Vijay Chandra vs Baijnath Choubey"
    print(f"\n[TEST 1] Input: '{test_1_input}'")
    res1 = verify_legal_text_citations(test_1_input)
    status1 = res1.get("verification_status")
    print(f"Status: {status1}")
    print(f"Result details: {json.dumps(res1, indent=2)}")
    assert status1 in ["VERIFIED", "PARTIALLY_VERIFIED"], f"Expected VERIFIED/PARTIALLY_VERIFIED but got {status1}"
    print("PASSED TEST 1!")

    # Test Case 2: Fake/Non-existent Judgment
    test_2_input = "Fake Case XYZ (2025) 99 SCC 999"
    print(f"\n[TEST 2] Input: '{test_2_input}'")
    res2 = verify_legal_text_citations(test_2_input)
    status2 = res2.get("verification_status")
    print(f"Status: {status2}")
    print(f"Result details: {json.dumps(res2, indent=2)}")
    assert status2 == "NOT_FOUND", f"Expected NOT_FOUND but got {status2}"
    print("PASSED TEST 2!")

    # Test Case 3: Valid Citation & Case
    test_3_input = "According to Vidarbha Industries Power Limited vs Axis Bank Ltd (2022) 8 SCC 352, the NCLT has discretion under Section 7(5)(a)."
    print(f"\n[TEST 3] Input: '{test_3_input}'")
    res3 = verify_legal_text_citations(test_3_input)
    status3 = res3.get("verification_status")
    print(f"Status: {status3}")
    assert status3 == "VERIFIED", f"Expected VERIFIED but got {status3}"
    print("PASSED TEST 3!")

    print("\n" + "=" * 60)
    print("ALL TEST CASES PASSED SUCCESSFULLY!")
    print("=" * 60)


if __name__ == "__main__":
    test_citation_verification()
