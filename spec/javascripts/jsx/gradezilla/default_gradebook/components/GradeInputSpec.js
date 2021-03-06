/*
 * Copyright (C) 2017 - present Instructure, Inc.
 *
 * This file is part of Canvas.
 *
 * Canvas is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License as published by the Free
 * Software Foundation, version 3 of the License.
 *
 * Canvas is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
 * details.
 *
 * You should have received a copy of the GNU Affero General Public License along
 * with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import React from 'react';
import { mount } from 'enzyme';
import GradeInput from 'jsx/gradezilla/default_gradebook/components/GradeInput';

/* eslint qunit/no-identical-names: 0 */

QUnit.module('GradeInput', (suiteHooks) => {
  let $container;
  let assignment;
  let submission;
  let props;
  let wrapper;

  suiteHooks.beforeEach(() => {
    assignment = {
      gradingType: 'points',
    };
    submission = {
      excused: false,
      id: '2501'
    };
    const gradingScheme = [['A', 0.90], ['B+', 0.85], ['B', 0.80], ['B-', 0.75]];
    props = {
      assignment,
      disabled: false,
      onSubmissionUpdate () {},
      submission,
      gradingScheme
    };

    $container = document.createElement('div');
    document.body.appendChild($container);
  });

  suiteHooks.afterEach(() => {
    wrapper.unmount();
    $container.remove();
  });

  function mountComponent () {
    wrapper = mount(<GradeInput {...props} />, { attachTo: $container });
  }

  QUnit.module('with a "points" assignment', (hooks) => {
    hooks.beforeEach(() => {
      props.assignment.pointsPossible = 10;
      props.submission.enteredScore = 7.8;
      props.submission.enteredGrade = '7.8';
      props.enterGradesAs = 'points';
    });

    test('renders a text input', () => {
      mountComponent();
      const input = wrapper.find('input[type="text"]');
      strictEqual(input.length, 1);
    });

    QUnit.module('when enterGradesAs is points', (contextHooks) => {
      contextHooks.beforeEach(() => {
        props.enterGradesAs = 'points';
      });

      test('displays a label of "Grade out of <points possible>"', () => {
        mountComponent();
        equal(wrapper.find('label').text(), 'Grade out of 10');
      });

      test('sets the formatted entered score of the submission as the input value', () => {
        mountComponent();
        const input = wrapper.find('input');
        strictEqual(input.prop('value'), '7.8');
      });

      test('rounds the formatted entered score to two decimal places', () => {
        submission.enteredScore = '7.816';
        mountComponent();
        const input = wrapper.find('input');
        strictEqual(input.prop('value'), '7.82');
      });

      test('strips insignificant zeros', () => {
        submission.enteredScore = '8.00';
        mountComponent();
        const input = wrapper.find('input');
        strictEqual(input.prop('value'), '8');
      });
    });

    QUnit.module('when enterGradesAs is percent', (contextHooks) => {
      contextHooks.beforeEach(() => {
        props.enterGradesAs = 'percent';
      });

      test('displays a label of "Grade out of <points possible>"', () => {
        mountComponent();
        equal(wrapper.find('label').text(), 'Grade out of 100%');
      });

      test('sets the formatted entered score of the submission as the input value', () => {
        mountComponent();
        const input = wrapper.find('input');
        strictEqual(input.prop('value'), '78%');
      });

      test('rounds the formatted entered score to two decimal places', () => {
        submission.enteredScore = '7.8916';
        mountComponent();
        const input = wrapper.find('input');
        strictEqual(input.prop('value'), '78.92%');
      });

      test('strips insignificant zeros', () => {
        submission.enteredScore = '8.00';
        mountComponent();
        const input = wrapper.find('input');
        strictEqual(input.prop('value'), '80%');
      });
    });

    test('is blank when the submission is not graded', () => {
      submission.enteredScore = null;
      mountComponent();
      const input = wrapper.find('input');
      strictEqual(input.prop('value'), '–');
    });

    test('displays "Excused" as the input value when the submission is excused', () => {
      submission.excused = true;
      mountComponent();
      const input = wrapper.find('input');
      strictEqual(input.prop('value'), 'Excused');
    });

    test('disables the input when the submission is excused', () => {
      submission.excused = true;
      mountComponent();
      const input = wrapper.find('input');
      strictEqual(input.prop('disabled'), true);
    });

    test('disables the input when submissionUpdating is true', () => {
      props.submissionUpdating = true;
      mountComponent();
      const input = wrapper.find('input');
      strictEqual(input.prop('disabled'), true);
    });

    test('enables the input when submissionUpdating is false', () => {
      mountComponent();
      const input = wrapper.find('input');
      strictEqual(input.prop('disabled'), false);
    });

    test('calls the onSubmissionUpdate prop when the value has changed and the input loses focus', () => {
      props.onSubmissionUpdate = sinon.spy();
      mountComponent();
      wrapper.find('input').simulate('change', { target: { value: '8.9' } });
      wrapper.find('input').simulate('blur');
      strictEqual(props.onSubmissionUpdate.callCount, 1);
    });

    test('calls the onSubmissionUpdate prop with the updated submission', () => {
      props.onSubmissionUpdate = sinon.spy();
      mountComponent();
      wrapper.find('input').simulate('change', { target: { value: '8.9' } });
      wrapper.find('input').simulate('blur');
      const [updatedSubmission] = props.onSubmissionUpdate.lastCall.args;
      strictEqual(updatedSubmission.enteredGrade, '8.9');
    });

    test('does not call the onSubmissionUpdate prop when the value has changed and input maintains focus', () => {
      props.onSubmissionUpdate = sinon.spy();
      mountComponent();
      wrapper.find('input').simulate('change', { target: { value: '8.9' } });
      strictEqual(props.onSubmissionUpdate.callCount, 0);
    });

    test('does not call the onSubmissionUpdate prop when the value has not changed from initial value', () => {
      props.onSubmissionUpdate = sinon.spy();
      mountComponent();
      wrapper.find('input').simulate('change', { target: { value: '8.9' } });
      wrapper.find('input').simulate('change', { target: { value: '7.8' } });
      wrapper.find('input').simulate('blur');
      strictEqual(props.onSubmissionUpdate.callCount, 0);
    });

    test('does not call the onSubmissionUpdate prop when the value has not changed from a null value', () => {
      props.submission.enteredGrade = null;
      props.onSubmissionUpdate = sinon.spy();
      mountComponent();
      wrapper.find('input').simulate('blur');
      strictEqual(props.onSubmissionUpdate.callCount, 0);
    });

    test('displays "Excused" as the input value when input blurs with a value of "EX"', () => {
      mountComponent();
      const input = wrapper.find('input');
      input.simulate('change', { target: { value: 'EX' } });
      input.simulate('blur');
      strictEqual(input.prop('value'), 'Excused');
    });

    test('trims whitespace from the input value when blurring', () => {
      mountComponent();
      const input = wrapper.find('input');
      input.simulate('change', { target: { value: ' EX ' } });
      input.simulate('blur');
      strictEqual(input.prop('value'), 'Excused');
    });

    test('does not update the input value when the submission begins updating', () => {
      mountComponent();
      const updatedSubmission = { ...submission, enteredGrade: '8.9' };
      wrapper.setProps({ submission: updatedSubmission, submissionUpdating: true });
      const input = wrapper.find('input');
      strictEqual(input.prop('value'), '7.8');
    });

    test('updates the input value when the submission is replaced', () => {
      mountComponent();
      const nextSubmission = { excused: false, enteredScore: '8.9', enteredGrade: '8.9', id: '2502' };
      wrapper.setProps({ submission: nextSubmission, submissionUpdating: true });
      const input = wrapper.find('input');
      strictEqual(input.prop('value'), '8.9');
    });

    test('updates the input value when the submission has updated', () => {
      props.submissionUpdating = true;
      mountComponent();
      const updatedSubmission = { ...submission, enteredScore: '8.9', enteredGrade: '8.9' };
      wrapper.setProps({ submission: updatedSubmission, submissionUpdating: false });
      const input = wrapper.find('input');
      strictEqual(input.prop('value'), '8.9');
    });

    test('rounds the formatted entered score of the updated submission to two decimal places', () => {
      props.submissionUpdating = true;
      mountComponent();
      wrapper.setProps({ submission: { ...submission, enteredScore: '7.816', enteredGrade: '7.816' }, submissionUpdating: false });
      const input = wrapper.find('input');
      strictEqual(input.prop('value'), '7.82');
    });

    test('strips insignificant zeros on the updated grade', () => {
      props.submissionUpdating = true;
      mountComponent();
      wrapper.setProps({ submission: { ...submission, enteredScore: '8.00', enteredGrade: '8.00' }, submissionUpdating: false });
      const input = wrapper.find('input');
      strictEqual(input.prop('value'), '8');
    });

    test('is blank when the updated submission is not graded', () => {
      props.submissionUpdating = true;
      mountComponent();
      wrapper.setProps({ submission: { ...submission, enteredGrade: null }, submissionUpdating: false });
      const input = wrapper.find('input');
      strictEqual(input.prop('value'), '');
    });

    test('does not call the onSubmissionUpdate prop a submission update and the input has not changed', () => {
      // this prevents the input from calling onSubmissionUpdate when
      // its value was already updated after a successful change
      props.submissionUpdating = true;
      mountComponent();
      wrapper.find('input').simulate('change', { target: { value: '8.9' } });
      const onSubmissionUpdate = sinon.spy();
      const updatedSubmission = { ...submission, enteredScore: '8.9', enteredGrade: '8.9' };
      wrapper.setProps({ onSubmissionUpdate, submission: updatedSubmission, submissionUpdating: false });
      wrapper.find('input').simulate('blur');
      strictEqual(onSubmissionUpdate.callCount, 0);
    });

    test('ignores onSubmissionUpdate when not defined', () => {
      delete props.onSubmissionUpdate;
      mountComponent();
      wrapper.find('input').simulate('change', { target: { value: '8.9' } });
      wrapper.find('input').simulate('blur');
      ok(true, 'missing onSubmissionUpdate prop is ignored');
    });

    test('does not update the input when props update without changing the entered score on the submission', () => {
      mountComponent();
      wrapper.find('input').simulate('change', { target: { value: '8.9' } });
      wrapper.setProps({ submission: { ...submission } });
      const input = wrapper.find('input');
      strictEqual(input.prop('value'), '8.9');
    });
  });

  QUnit.module('with a "percent" assignment', (hooks) => {
    hooks.beforeEach(() => {
      props.assignment.pointsPossible = 100;
      props.submission.enteredScore = 78;
      props.submission.enteredGrade = '78%';
      props.enterGradesAs = 'percent';
    });

    test('renders a text input', () => {
      mountComponent();
      const input = wrapper.find('input[type="text"]');
      strictEqual(input.length, 1);
    });

    test('displays a label of "Grade out of 100%"', () => {
      mountComponent();
      equal(wrapper.find('label').text(), 'Grade out of 100%');
    });

    QUnit.module('when enterGradesAs is percent', (contextHooks) => {
      contextHooks.beforeEach(() => {
        props.enterGradesAs = 'percent';
      });

      test('displays a label of "Grade out of <points possible>"', () => {
        mountComponent();
        equal(wrapper.find('label').text(), 'Grade out of 100%');
      });

      test('sets the formatted entered score of the submission as the input value', () => {
        mountComponent();
        const input = wrapper.find('input');
        strictEqual(input.prop('value'), '78%');
      });

      test('rounds the formatted entered score to two decimal places', () => {
        submission.enteredScore = '78.206';
        mountComponent();
        const input = wrapper.find('input');
        strictEqual(input.prop('value'), '78.21%');
      });

      test('strips insignificant zeros', () => {
        submission.enteredScore = '80.00';
        mountComponent();
        const input = wrapper.find('input');
        strictEqual(input.prop('value'), '80%');
      });
    });

    QUnit.module('when enterGradesAs is points', (contextHooks) => {
      contextHooks.beforeEach(() => {
        props.enterGradesAs = 'points';
      });

      test('displays a label of "Grade out of <points possible>"', () => {
        mountComponent();
        equal(wrapper.find('label').text(), 'Grade out of 100');
      });

      test('sets the formatted entered score of the submission as the input value', () => {
        mountComponent();
        const input = wrapper.find('input');
        strictEqual(input.prop('value'), '78');
      });

      test('rounds the formatted entered score to two decimal places', () => {
        submission.enteredScore = '78.916';
        mountComponent();
        const input = wrapper.find('input');
        strictEqual(input.prop('value'), '78.92');
      });

      test('strips insignificant zeros', () => {
        submission.enteredScore = '80.00';
        mountComponent();
        const input = wrapper.find('input');
        strictEqual(input.prop('value'), '80');
      });
    });

    test('is blank when the submission is not graded', () => {
      submission.enteredGrade = null;
      mountComponent();
      const input = wrapper.find('input');
      strictEqual(input.prop('value'), '');
    });

    test('displays "Excused" as the input value when the submission is excused', () => {
      submission.excused = true;
      mountComponent();
      const input = wrapper.find('input');
      strictEqual(input.prop('value'), 'Excused');
    });

    test('disables the input when the submission is excused', () => {
      submission.excused = true;
      mountComponent();
      const input = wrapper.find('input');
      strictEqual(input.prop('disabled'), true);
    });

    test('disables the input when disabled is true', () => {
      props.disabled = true;
      mountComponent();
      const input = wrapper.find('input');
      strictEqual(input.prop('disabled'), true);
    });

    test('disables the input when submissionUpdating is true', () => {
      props.submissionUpdating = true;
      mountComponent();
      const input = wrapper.find('input');
      strictEqual(input.prop('disabled'), true);
    });

    test('enables the input when submissionUpdating is false', () => {
      mountComponent();
      const input = wrapper.find('input');
      strictEqual(input.prop('disabled'), false);
    });

    test('calls the onSubmissionUpdate prop when the value has changed and the input loses focus', () => {
      props.onSubmissionUpdate = sinon.spy();
      mountComponent();
      wrapper.find('input').simulate('change', { target: { value: '89%' } });
      wrapper.find('input').simulate('blur');
      strictEqual(props.onSubmissionUpdate.callCount, 1);
    });

    test('calls the onSubmissionUpdate prop with the updated submission', () => {
      props.onSubmissionUpdate = sinon.spy();
      mountComponent();
      wrapper.find('input').simulate('change', { target: { value: '89%' } });
      wrapper.find('input').simulate('blur');
      const [updatedSubmission] = props.onSubmissionUpdate.lastCall.args;
      strictEqual(updatedSubmission.enteredGrade, '89%');
    });

    test('does not call the onSubmissionUpdate prop when the value has changed and input maintains focus', () => {
      props.onSubmissionUpdate = sinon.spy();
      mountComponent();
      wrapper.find('input').simulate('change', { target: { value: '89%' } });
      strictEqual(props.onSubmissionUpdate.callCount, 0);
    });

    test('does not call the onSubmissionUpdate prop when the value has not changed from initial value', () => {
      props.onSubmissionUpdate = sinon.spy();
      mountComponent();
      wrapper.find('input').simulate('change', { target: { value: '89%' } });
      wrapper.find('input').simulate('change', { target: { value: '78%' } });
      wrapper.find('input').simulate('blur');
      strictEqual(props.onSubmissionUpdate.callCount, 0);
    });

    test('displays "Excused" as the input value when input blurs with a value of "EX"', () => {
      mountComponent();
      const input = wrapper.find('input');
      input.simulate('change', { target: { value: 'EX' } });
      input.simulate('blur');
      strictEqual(input.prop('value'), 'Excused');
    });

    test('does not update the input value when the submission begins updating', () => {
      mountComponent();
      const updatedSubmission = { ...submission, enteredGrade: '89%' };
      wrapper.setProps({ submission: updatedSubmission, submissionUpdating: true });
      const input = wrapper.find('input');
      strictEqual(input.prop('value'), '78%');
    });

    test('updates the input value when the submission has updated', () => {
      props.submissionUpdating = true;
      mountComponent();
      const updatedSubmission = { ...submission, enteredScore: '89', enteredGrade: '89%' };
      wrapper.setProps({ submission: updatedSubmission, submissionUpdating: false });
      const input = wrapper.find('input');
      strictEqual(input.prop('value'), '89%');
    });

    test('rounds the formatted entered score of the updated submission to two decimal places', () => {
      props.submissionUpdating = true;
      mountComponent();
      wrapper.setProps({ submission: { ...submission, enteredScore: '78.916', enteredGrade: '78.916%' }, submissionUpdating: false });
      const input = wrapper.find('input');
      strictEqual(input.prop('value'), '78.92%');
    });

    test('strips insignificant zeros on the updated grade', () => {
      props.submissionUpdating = true;
      mountComponent();
      wrapper.setProps({ submission: { ...submission, enteredScore: '89.00', enteredGrade: '89.00%' }, submissionUpdating: false });
      const input = wrapper.find('input');
      strictEqual(input.prop('value'), '89%');
    });

    test('is blank when the updated submission is not graded', () => {
      props.submissionUpdating = true;
      mountComponent();
      wrapper.setProps({ submission: { ...submission, enteredGrade: null }, submissionUpdating: false });
      const input = wrapper.find('input');
      strictEqual(input.prop('value'), '');
    });

    test('does not call the onSubmissionUpdate prop a submission update and the input has not changed', () => {
      // this prevents the input from calling onSubmissionUpdate when
      // its value was already updated after a successful change
      props.submissionUpdating = true;
      mountComponent();
      wrapper.find('input').simulate('change', { target: { value: '89%' } });
      const onSubmissionUpdate = sinon.spy();
      const updatedSubmission = { ...submission, enteredScore: '89', enteredGrade: '89%' };
      wrapper.setProps({ onSubmissionUpdate, submission: updatedSubmission, submissionUpdating: false });
      wrapper.find('input').simulate('blur');
      strictEqual(onSubmissionUpdate.callCount, 0);
    });

    test('ignores onSubmissionUpdate when not defined', () => {
      delete props.onSubmissionUpdate;
      mountComponent();
      wrapper.find('input').simulate('change', { target: { value: '89%' } });
      wrapper.find('input').simulate('blur');
      ok(true, 'missing onSubmissionUpdate prop is ignored');
    });

    test('does not update the input when props update without changing the entered score on the submission', () => {
      mountComponent();
      wrapper.find('input').simulate('change', { target: { value: '89%' } });
      wrapper.setProps({ submission: { ...submission } });
      const input = wrapper.find('input');
      strictEqual(input.prop('value'), '89%');
    });
  });

  QUnit.module('with a "letter grade" assignment', (hooks) => {
    hooks.beforeEach(() => {
      props.assignment.pointsPossible = 100;
      props.assignment.gradingType = 'letter_grade';
      props.enterGradesAs = 'gradingScheme'
      props.submission.enteredScore = 78;
      props.submission.enteredGrade = 'B';
    });

    test('renders a text input', () => {
      mountComponent();
      const input = wrapper.find('input[type="text"]');
      strictEqual(input.length, 1);
    });

    QUnit.module('when enterGradesAs is gradingScheme', (contextHooks) => {
      contextHooks.beforeEach(() => {
        props.enterGradesAs = 'gradingScheme';
      });

      test('displays a label of "Letter Grade"', () => {
        mountComponent();
        equal(wrapper.find('label').text(), 'Letter Grade');
      });

      test('sets as the input value the grade corresponding to the entered score', () => {
        mountComponent();
        const input = wrapper.find('input');
        equal(input.prop('value'), 'B-');
      });
    });

    QUnit.module('when enterGradesAs is points', (contextHooks) => {
      contextHooks.beforeEach(() => {
        props.enterGradesAs = 'points';
      });

      test('displays a label of "Grade out of <points possible>"', () => {
        mountComponent();
        equal(wrapper.find('label').text(), 'Grade out of 100');
      });

      test('sets the formatted entered score of the submission as the input value', () => {
        mountComponent();
        const input = wrapper.find('input');
        strictEqual(input.prop('value'), '78');
      });

      test('rounds the formatted entered score to two decimal places', () => {
        submission.enteredScore = '78.916';
        mountComponent();
        const input = wrapper.find('input');
        strictEqual(input.prop('value'), '78.92');
      });

      test('strips insignificant zeros', () => {
        submission.enteredScore = '80.00';
        mountComponent();
        const input = wrapper.find('input');
        strictEqual(input.prop('value'), '80');
      });
    });

    QUnit.module('when enterGradesAs is percent', (contextHooks) => {
      contextHooks.beforeEach(() => {
        props.enterGradesAs = 'percent';
      });

      test('displays a label of "Grade out of <points possible>"', () => {
        mountComponent();
        equal(wrapper.find('label').text(), 'Grade out of 100%');
      });

      test('sets the formatted entered score of the submission as the input value', () => {
        mountComponent();
        const input = wrapper.find('input');
        strictEqual(input.prop('value'), '78%');
      });

      test('rounds the formatted entered score to two decimal places', () => {
        submission.enteredScore = '78.916';
        mountComponent();
        const input = wrapper.find('input');
        strictEqual(input.prop('value'), '78.92%');
      });

      test('strips insignificant zeros', () => {
        submission.enteredScore = '80.00';
        mountComponent();
        const input = wrapper.find('input');
        strictEqual(input.prop('value'), '80%');
      });
    });

    test('is blank when the submission is not graded', () => {
      submission.enteredGrade = null;
      mountComponent();
      const input = wrapper.find('input');
      strictEqual(input.prop('value'), '');
    });

    test('displays "Excused" as the input value when the submission is excused', () => {
      submission.excused = true;
      mountComponent();
      const input = wrapper.find('input');
      strictEqual(input.prop('value'), 'Excused');
    });

    test('disables the input when the submission is excused', () => {
      submission.excused = true;
      mountComponent();
      const input = wrapper.find('input');
      strictEqual(input.prop('disabled'), true);
    });

    test('disables the input when disabled is true', () => {
      props.disabled = true;
      mountComponent();
      const input = wrapper.find('input');
      strictEqual(input.prop('disabled'), true);
    });

    test('disables the input when submissionUpdating is true', () => {
      props.submissionUpdating = true;
      mountComponent();
      const input = wrapper.find('input');
      strictEqual(input.prop('disabled'), true);
    });

    test('enables the input when submissionUpdating is false', () => {
      mountComponent();
      const input = wrapper.find('input');
      strictEqual(input.prop('disabled'), false);
    });

    test('calls the onSubmissionUpdate prop when the value has changed and the input loses focus', () => {
      props.onSubmissionUpdate = sinon.spy();
      mountComponent();
      wrapper.find('input').simulate('change', { target: { value: 'A' } });
      wrapper.find('input').simulate('blur');
      strictEqual(props.onSubmissionUpdate.callCount, 1);
    });

    test('calls the onSubmissionUpdate prop with the updated submission', () => {
      props.onSubmissionUpdate = sinon.spy();
      mountComponent();
      wrapper.find('input').simulate('change', { target: { value: 'A' } });
      wrapper.find('input').simulate('blur');
      const [updatedSubmission] = props.onSubmissionUpdate.lastCall.args;
      strictEqual(updatedSubmission.enteredGrade, 'A');
    });

    test('does not call the onSubmissionUpdate prop when the value has changed and input maintains focus', () => {
      props.onSubmissionUpdate = sinon.spy();
      mountComponent();
      wrapper.find('input').simulate('change', { target: { value: 'A' } });
      strictEqual(props.onSubmissionUpdate.callCount, 0);
    });

    test('does not call the onSubmissionUpdate prop when the value has not changed from initial value', () => {
      props.onSubmissionUpdate = sinon.spy();
      mountComponent();
      wrapper.find('input').simulate('change', { target: { value: 'A' } });
      wrapper.find('input').simulate('change', { target: { value: 'B' } });
      wrapper.find('input').simulate('blur');
      strictEqual(props.onSubmissionUpdate.callCount, 0);
    });

    test('displays "Excused" as the input value when input blurs with a value of "EX"', () => {
      mountComponent();
      const input = wrapper.find('input');
      input.simulate('change', { target: { value: 'EX' } });
      input.simulate('blur');
      strictEqual(input.prop('value'), 'Excused');
    });

    test('does not update the input value when the submission begins updating', () => {
      mountComponent();
      const updatedSubmission = { ...submission, enteredScore: 100, enteredGrade: 'A' };
      wrapper.setProps({ submission: updatedSubmission, submissionUpdating: true });
      const input = wrapper.find('input');
      strictEqual(input.prop('value'), 'B-');
    });

    test('updates the input value when the submission has updated', () => {
      props.submissionUpdating = true;
      mountComponent();
      const updatedSubmission = { ...submission, enteredScore: 100, enteredGrade: 'A' };
      wrapper.setProps({ submission: updatedSubmission, submissionUpdating: false });
      const input = wrapper.find('input');
      strictEqual(input.prop('value'), 'A');
    });

    test('is blank when the updated submission is not graded', () => {
      props.submissionUpdating = true;
      mountComponent();
      wrapper.setProps({ submission: { ...submission, enteredGrade: null }, submissionUpdating: false });
      const input = wrapper.find('input');
      strictEqual(input.prop('value'), '');
    });

    test('does not call the onSubmissionUpdate prop a submission update and the input has not changed', () => {
      // this prevents the input from calling onSubmissionUpdate when
      // its value was already updated after a successful change
      props.submissionUpdating = true;
      mountComponent();
      wrapper.find('input').simulate('change', { target: { value: 'A' } });
      const onSubmissionUpdate = sinon.spy();
      const updatedSubmission = { ...submission, enteredGrade: 'A' };
      wrapper.setProps({ onSubmissionUpdate, submission: updatedSubmission, submissionUpdating: false });
      wrapper.find('input').simulate('blur');
      strictEqual(onSubmissionUpdate.callCount, 0);
    });

    test('ignores onSubmissionUpdate when not defined', () => {
      delete props.onSubmissionUpdate;
      mountComponent();
      wrapper.find('input').simulate('change', { target: { value: 'A' } });
      wrapper.find('input').simulate('blur');
      ok(true, 'missing onSubmissionUpdate prop is ignored');
    });

    test('does not update the input when props update without changing the entered score on the submission', () => {
      mountComponent();
      wrapper.find('input').simulate('change', { target: { value: 'A' } });
      wrapper.setProps({ submission: { ...submission } });
      const input = wrapper.find('input');
      strictEqual(input.prop('value'), 'A');
    });
  });

  QUnit.module('with a "GPA scale" assignment', (hooks) => {
    hooks.beforeEach(() => {
      props.assignment.pointsPossible = 100;
      props.assignment.gradingType = 'gpa_scale';
      props.enterGradesAs = 'gradingScheme'
      props.submission.enteredScore = 78;
      props.submission.enteredGrade = 'B';
    });

    test('renders a text input', () => {
      mountComponent();
      const input = wrapper.find('input[type="text"]');
      strictEqual(input.length, 1);
    });

    QUnit.module('when enterGradesAs is gradingScheme', (contextHooks) => {
      contextHooks.beforeEach(() => {
        props.enterGradesAs = 'gradingScheme';
      });

      test('displays a label of "Letter Grade"', () => {
        mountComponent();
        equal(wrapper.find('label').text(), 'Letter Grade');
      });

      test('sets as the input value the grade corresponding to the entered score', () => {
        mountComponent();
        const input = wrapper.find('input');
        equal(input.prop('value'), 'B-');
      });
    });

    QUnit.module('when enterGradesAs is points', (contextHooks) => {
      contextHooks.beforeEach(() => {
        props.enterGradesAs = 'points';
      });

      test('displays a label of "Grade out of <points possible>"', () => {
        mountComponent();
        equal(wrapper.find('label').text(), 'Grade out of 100');
      });

      test('sets the formatted entered score of the submission as the input value', () => {
        mountComponent();
        const input = wrapper.find('input');
        strictEqual(input.prop('value'), '78');
      });

      test('rounds the formatted entered score to two decimal places', () => {
        submission.enteredScore = '78.916';
        mountComponent();
        const input = wrapper.find('input');
        strictEqual(input.prop('value'), '78.92');
      });

      test('strips insignificant zeros', () => {
        submission.enteredScore = '80.00';
        mountComponent();
        const input = wrapper.find('input');
        strictEqual(input.prop('value'), '80');
      });
    });

    QUnit.module('when enterGradesAs is percent', (contextHooks) => {
      contextHooks.beforeEach(() => {
        props.enterGradesAs = 'percent';
      });

      test('displays a label of "Grade out of <points possible>"', () => {
        mountComponent();
        equal(wrapper.find('label').text(), 'Grade out of 100%');
      });

      test('sets the formatted entered score of the submission as the input value', () => {
        mountComponent();
        const input = wrapper.find('input');
        strictEqual(input.prop('value'), '78%');
      });

      test('rounds the formatted entered score to two decimal places', () => {
        submission.enteredScore = '78.916';
        mountComponent();
        const input = wrapper.find('input');
        strictEqual(input.prop('value'), '78.92%');
      });

      test('strips insignificant zeros', () => {
        submission.enteredScore = '80.00';
        mountComponent();
        const input = wrapper.find('input');
        strictEqual(input.prop('value'), '80%');
      });
    });

    test('is blank when the submission is not graded', () => {
      submission.enteredGrade = null;
      mountComponent();
      const input = wrapper.find('input');
      strictEqual(input.prop('value'), '');
    });

    test('displays "Excused" as the input value when the submission is excused', () => {
      submission.excused = true;
      mountComponent();
      const input = wrapper.find('input');
      strictEqual(input.prop('value'), 'Excused');
    });

    test('disables the input when the submission is excused', () => {
      submission.excused = true;
      mountComponent();
      const input = wrapper.find('input');
      strictEqual(input.prop('disabled'), true);
    });

    test('disables the input when disabled is true', () => {
      props.disabled = true;
      mountComponent();
      const input = wrapper.find('input');
      strictEqual(input.prop('disabled'), true);
    });

    test('disables the input when submissionUpdating is true', () => {
      props.submissionUpdating = true;
      mountComponent();
      const input = wrapper.find('input');
      strictEqual(input.prop('disabled'), true);
    });

    test('enables the input when submissionUpdating is false', () => {
      mountComponent();
      const input = wrapper.find('input');
      strictEqual(input.prop('disabled'), false);
    });

    test('calls the onSubmissionUpdate prop when the value has changed and the input loses focus', () => {
      props.onSubmissionUpdate = sinon.spy();
      mountComponent();
      wrapper.find('input').simulate('change', { target: { value: 'A' } });
      wrapper.find('input').simulate('blur');
      strictEqual(props.onSubmissionUpdate.callCount, 1);
    });

    test('calls the onSubmissionUpdate prop with the updated submission', () => {
      props.onSubmissionUpdate = sinon.spy();
      mountComponent();
      wrapper.find('input').simulate('change', { target: { value: 'A' } });
      wrapper.find('input').simulate('blur');
      const [updatedSubmission] = props.onSubmissionUpdate.lastCall.args;
      strictEqual(updatedSubmission.enteredGrade, 'A');
    });

    test('does not call the onSubmissionUpdate prop when the value has changed and input maintains focus', () => {
      props.onSubmissionUpdate = sinon.spy();
      mountComponent();
      wrapper.find('input').simulate('change', { target: { value: 'A' } });
      strictEqual(props.onSubmissionUpdate.callCount, 0);
    });

    test('does not call the onSubmissionUpdate prop when the value has not changed from initial value', () => {
      props.onSubmissionUpdate = sinon.spy();
      mountComponent();
      wrapper.find('input').simulate('change', { target: { value: 'A' } });
      wrapper.find('input').simulate('change', { target: { value: 'B' } });
      wrapper.find('input').simulate('blur');
      strictEqual(props.onSubmissionUpdate.callCount, 0);
    });

    test('displays "Excused" as the input value when input blurs with a value of "EX"', () => {
      mountComponent();
      const input = wrapper.find('input');
      input.simulate('change', { target: { value: 'EX' } });
      input.simulate('blur');
      strictEqual(input.prop('value'), 'Excused');
    });

    test('does not update the input value when the submission begins updating', () => {
      mountComponent();
      const updatedSubmission = { ...submission, enteredScore: 100, enteredGrade: 'A' };
      wrapper.setProps({ submission: updatedSubmission, submissionUpdating: true });
      const input = wrapper.find('input');
      strictEqual(input.prop('value'), 'B-');
    });

    test('updates the input value when the submission has updated', () => {
      props.submissionUpdating = true;
      mountComponent();
      const updatedSubmission = { ...submission, enteredScore: 100, enteredGrade: 'A' };
      wrapper.setProps({ submission: updatedSubmission, submissionUpdating: false });
      const input = wrapper.find('input');
      strictEqual(input.prop('value'), 'A');
    });

    test('is blank when the updated submission is not graded', () => {
      props.submissionUpdating = true;
      mountComponent();
      wrapper.setProps({ submission: { ...submission, enteredGrade: null }, submissionUpdating: false });
      const input = wrapper.find('input');
      strictEqual(input.prop('value'), '');
    });

    test('does not call the onSubmissionUpdate prop a submission update and the input has not changed', () => {
      // this prevents the input from calling onSubmissionUpdate when
      // its value was already updated after a successful change
      props.submissionUpdating = true;
      mountComponent();
      wrapper.find('input').simulate('change', { target: { value: 'A' } });
      const onSubmissionUpdate = sinon.spy();
      const updatedSubmission = { ...submission, enteredScore: 100, enteredGrade: 'A' };
      wrapper.setProps({ onSubmissionUpdate, submission: updatedSubmission, submissionUpdating: false });
      wrapper.find('input').simulate('blur');
      strictEqual(onSubmissionUpdate.callCount, 0);
    });

    test('ignores onSubmissionUpdate when not defined', () => {
      delete props.onSubmissionUpdate;
      mountComponent();
      wrapper.find('input').simulate('change', { target: { value: 'A' } });
      wrapper.find('input').simulate('blur');
      ok(true, 'missing onSubmissionUpdate prop is ignored');
    });

    test('does not update the input when props update without changing the entered score on the submission', () => {
      mountComponent();
      wrapper.find('input').simulate('change', { target: { value: 'A' } });
      wrapper.setProps({ submission: { ...submission } });
      const input = wrapper.find('input');
      strictEqual(input.prop('value'), 'A');
    });
  });

  QUnit.module('with a "pass/fail" assignment', (hooks) => {
    hooks.beforeEach(() => {
      props.assignment.pointsPossible = 100;
      props.submission.enteredScore = 0;
      props.assignment.gradingType = 'pass_fail';
      props.submission.enteredGrade = 'incomplete';
      props.enterGradesAs = 'passFail';
    });

    test('renders a select input', () => {
      mountComponent();
      const input = wrapper.find('select');
      strictEqual(input.length, 1);
    });

    test('displays a label of "Grade"', () => {
      mountComponent();
      const optionsText = wrapper.find('option').map(option => option.text()).join('');
      const label = wrapper.find('label').text();
      equal(label.replace(optionsText, ''), 'Grade');
    });

    test('includes empty string (""), "complete," and "incomplete" as options values', () => {
      mountComponent();
      const options = wrapper.find('option');
      deepEqual(options.map(option => option.prop('value')), ['', 'complete', 'incomplete']);
    });

    test('includes "Ungraded," "Complete," and "Incomplete" as options text', () => {
      mountComponent();
      const options = wrapper.find('option');
      deepEqual(options.map(option => option.text()), ['Ungraded', 'Complete', 'Incomplete']);
    });

    test('includes only "Excused" when the submission is excused', () => {
      submission.excused = true;
      mountComponent();
      const options = wrapper.find('option');
      deepEqual(options.map(option => option.text()), ['Excused']);
    });

    test('disables the input when the submission is excused', () => {
      submission.excused = true;
      mountComponent();
      const input = wrapper.find('select');
      strictEqual(input.prop('disabled'), true);
    });

    test('sets the select value to "Ungraded" when the submission is not graded', () => {
      submission.enteredGrade = null;
      mountComponent();
      const input = wrapper.find('select');
      strictEqual(input.prop('value'), '', 'empty string is the value for "Ungraded"');
    });

    test('sets the select value to "Complete" when the submission is complete', () => {
      submission.enteredScore = 100;
      submission.enteredGrade = 'complete';
      mountComponent();
      const input = wrapper.find('select');
      strictEqual(input.prop('value'), 'complete');
    });

    test('sets the select value to "Incomplete" when the submission is incomplete', () => {
      submission.enteredGrade = 'incomplete';
      mountComponent();
      const input = wrapper.find('select');
      strictEqual(input.prop('value'), 'incomplete');
    });

    test('disables the input when disabled is true', () => {
      props.disabled = true;
      mountComponent();
      const input = wrapper.find('select');
      strictEqual(input.prop('disabled'), true);
    });

    test('disables the input when submissionUpdating is true', () => {
      props.submissionUpdating = true;
      mountComponent();
      const input = wrapper.find('select');
      strictEqual(input.prop('disabled'), true);
    });

    test('enables the input when submissionUpdating is false', () => {
      mountComponent();
      const input = wrapper.find('select');
      strictEqual(input.prop('disabled'), false);
    });

    test('calls the onSubmissionUpdate prop when the value has changed', () => {
      props.onSubmissionUpdate = sinon.spy();
      mountComponent();
      wrapper.find('select').simulate('change', { target: { value: 'complete' } });
      strictEqual(props.onSubmissionUpdate.callCount, 1);
    });

    test('calls the onSubmissionUpdate prop with the updated submission', () => {
      props.onSubmissionUpdate = sinon.spy();
      mountComponent();
      wrapper.find('select').simulate('change', { target: { value: 'complete' } });
      const [updatedSubmission] = props.onSubmissionUpdate.lastCall.args;
      strictEqual(updatedSubmission.enteredGrade, 'complete');
    });

    test('does not update the input value when the submission begins updating', () => {
      mountComponent();
      const updatedSubmission = { ...submission, enteredGrade: 'complete' };
      wrapper.setProps({ submission: updatedSubmission, submissionUpdating: true });
      const input = wrapper.find('select');
      strictEqual(input.prop('value'), 'incomplete');
    });

    test('updates the input value when the submission has updated', () => {
      props.submissionUpdating = true;
      mountComponent();
      const updatedSubmission = { ...submission, enteredGrade: 'complete' };
      wrapper.setProps({ submission: updatedSubmission, submissionUpdating: false });
      const input = wrapper.find('select');
      strictEqual(input.prop('value'), 'complete');
    });
  });
});
